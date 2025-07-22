#!/bin/bash

# 🔒 JAGUAR FIGHT CLUB - Security Audit Script
# Проверка безопасности системы и приложения

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/opt/jaguar-app"

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[✅ PASS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[❌ FAIL]${NC} $1"
}

# Check system updates
check_system_updates() {
    log "Checking system updates..."
    
    if apt list --upgradable 2>/dev/null | grep -q upgradable; then
        warning "System updates available"
        apt list --upgradable 2>/dev/null | head -10
    else
        success "System is up to date"
    fi
}

# Check firewall status
check_firewall() {
    log "Checking firewall configuration..."
    
    if ufw status | grep -q "Status: active"; then
        success "UFW firewall is active"
        
        # Check important ports
        if ufw status | grep -q "80/tcp"; then
            success "HTTP port 80 is allowed"
        else
            error "HTTP port 80 not configured"
        fi
        
        if ufw status | grep -q "443/tcp"; then
            success "HTTPS port 443 is allowed"
        else
            error "HTTPS port 443 not configured"
        fi
        
        if ufw status | grep -q "22/tcp"; then
            success "SSH port 22 is allowed"
        else
            warning "SSH port 22 not explicitly allowed"
        fi
    else
        error "UFW firewall is not active"
    fi
}

# Check fail2ban status
check_fail2ban() {
    log "Checking fail2ban status..."
    
    if systemctl is-active --quiet fail2ban; then
        success "Fail2ban is running"
        
        # Check jails
        if command -v fail2ban-client >/dev/null 2>&1; then
            active_jails=$(fail2ban-client status 2>/dev/null | grep "Jail list" | cut -d: -f2 | tr -d ' \t')
            if [[ -n "$active_jails" ]]; then
                success "Active jails: $active_jails"
            else
                warning "No active fail2ban jails"
            fi
        fi
    else
        error "Fail2ban is not running"
    fi
}

# Check SSL certificates
check_ssl() {
    log "Checking SSL certificates..."
    
    if [[ -d "/etc/letsencrypt/live" ]]; then
        cert_dirs=$(find /etc/letsencrypt/live -maxdepth 1 -type d ! -name live | wc -l)
        if [[ $cert_dirs -gt 0 ]]; then
            success "SSL certificates found"
            
            # Check expiration
            for cert_dir in /etc/letsencrypt/live/*/; do
                if [[ -f "$cert_dir/fullchain.pem" ]]; then
                    domain=$(basename "$cert_dir")
                    expiry=$(openssl x509 -enddate -noout -in "$cert_dir/fullchain.pem" | cut -d= -f2)
                    expiry_epoch=$(date -d "$expiry" +%s)
                    current_epoch=$(date +%s)
                    days_left=$(( (expiry_epoch - current_epoch) / 86400 ))
                    
                    if [[ $days_left -gt 30 ]]; then
                        success "Certificate for $domain expires in $days_left days"
                    elif [[ $days_left -gt 7 ]]; then
                        warning "Certificate for $domain expires in $days_left days"
                    else
                        error "Certificate for $domain expires in $days_left days - URGENT!"
                    fi
                fi
            done
        else
            warning "No SSL certificates found"
        fi
    else
        warning "Let's Encrypt directory not found"
    fi
}

# Check Docker security
check_docker_security() {
    log "Checking Docker security..."
    
    if systemctl is-active --quiet docker; then
        success "Docker service is running"
        
        # Check for running containers
        running_containers=$(docker ps -q | wc -l)
        if [[ $running_containers -gt 0 ]]; then
            success "$running_containers containers are running"
            
            # Check container security
            echo "Container security scan:"
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | while read line; do
                echo "  $line"
            done
            
            # Check for privileged containers
            privileged=$(docker ps --filter "privileged=true" -q | wc -l)
            if [[ $privileged -eq 0 ]]; then
                success "No privileged containers running"
            else
                warning "$privileged privileged containers found"
            fi
        else
            warning "No Docker containers are running"
        fi
        
        # Check Docker daemon security
        if docker info 2>/dev/null | grep -q "Swarm: inactive"; then
            success "Docker Swarm is inactive (good for single-node)"
        fi
    else
        error "Docker service is not running"
    fi
}

# Check application security
check_app_security() {
    log "Checking application security..."
    
    if [[ -d "$APP_DIR" ]]; then
        cd "$APP_DIR"
        
        # Check environment files
        if [[ -f ".env" ]]; then
            if grep -q "CHANGE_THIS" .env 2>/dev/null; then
                error "Default secrets found in .env file"
            else
                success "Environment file looks configured"
            fi
            
            # Check permissions
            env_perms=$(stat -c "%a" .env)
            if [[ "$env_perms" == "600" || "$env_perms" == "640" ]]; then
                success "Environment file has secure permissions ($env_perms)"
            else
                warning "Environment file permissions could be more secure ($env_perms)"
            fi
        else
            warning "No .env file found"
        fi
        
        # Check backend environment
        if [[ -f "backend/.env" ]]; then
            if grep -q "CHANGE_THIS" backend/.env 2>/dev/null; then
                error "Default secrets found in backend/.env file"
            else
                success "Backend environment file looks configured"
            fi
        else
            warning "No backend .env file found"
        fi
        
        # Check for exposed sensitive files
        sensitive_files=(".env" "backend/.env" "*.key" "*.pem" "*.p12")
        for pattern in "${sensitive_files[@]}"; do
            if find . -name "$pattern" -type f 2>/dev/null | grep -v ".env" | head -1 | grep -q .; then
                warning "Sensitive files may be exposed: $pattern"
            fi
        done
        
    else
        error "Application directory not found: $APP_DIR"
    fi
}

# Check nginx security
check_nginx_security() {
    log "Checking nginx security..."
    
    if systemctl is-active --quiet nginx; then
        success "Nginx is running"
        
        # Check nginx version (shouldn't expose version)
        nginx_version=$(nginx -v 2>&1 | grep -o "nginx/[0-9.]*" || echo "unknown")
        echo "Nginx version: $nginx_version"
        
        # Check security headers in configuration
        if [[ -f "/etc/nginx/sites-available/jaguar-fight-club" ]]; then
            config_file="/etc/nginx/sites-available/jaguar-fight-club"
            
            headers=("X-Frame-Options" "X-XSS-Protection" "X-Content-Type-Options" "Strict-Transport-Security")
            for header in "${headers[@]}"; do
                if grep -q "$header" "$config_file"; then
                    success "Security header configured: $header"
                else
                    warning "Missing security header: $header"
                fi
            done
        else
            warning "Nginx configuration file not found"
        fi
        
    else
        error "Nginx is not running"
    fi
}

# Check open ports
check_open_ports() {
    log "Checking open ports..."
    
    echo "Open ports:"
    ss -tlnp | grep -E ":80|:443|:22|:3001" | while read line; do
        echo "  $line"
    done
    
    # Check for unexpected open ports
    unexpected_ports=$(ss -tlnp | awk '{print $4}' | grep -E ":([0-9]{4,5})$" | cut -d: -f2 | sort -n | grep -v -E "^(22|80|443|3001)$" | head -5)
    if [[ -n "$unexpected_ports" ]]; then
        warning "Unexpected open ports found: $unexpected_ports"
    else
        success "No unexpected open ports found"
    fi
}

# Check system logs for security issues
check_security_logs() {
    log "Checking security logs..."
    
    # Check for failed login attempts
    failed_logins=$(grep "Failed password" /var/log/auth.log 2>/dev/null | tail -5 | wc -l)
    if [[ $failed_logins -gt 0 ]]; then
        warning "$failed_logins recent failed login attempts found"
        echo "Recent failed attempts:"
        grep "Failed password" /var/log/auth.log 2>/dev/null | tail -3 | while read line; do
            echo "  $line"
        done
    else
        success "No recent failed login attempts"
    fi
    
    # Check for security-related entries
    security_events=$(journalctl --since "24 hours ago" | grep -i -E "(failed|error|attack|breach|unauthorized)" | wc -l)
    if [[ $security_events -gt 10 ]]; then
        warning "$security_events security-related events in last 24 hours"
    else
        success "Security event levels normal"
    fi
}

# Main security audit
main() {
    echo -e "${GREEN}🔒 JAGUAR FIGHT CLUB - Security Audit${NC}"
    echo "$(date)"
    echo "======================================="
    
    check_system_updates
    echo ""
    check_firewall
    echo ""
    check_fail2ban
    echo ""
    check_ssl
    echo ""
    check_docker_security
    echo ""
    check_app_security
    echo ""
    check_nginx_security
    echo ""
    check_open_ports
    echo ""
    check_security_logs
    
    echo ""
    echo -e "${GREEN}✅ Security audit completed!${NC}"
    echo ""
    echo "Recommendations:"
    echo "• Run this audit weekly: sudo $0"
    echo "• Monitor fail2ban logs: sudo fail2ban-client status"
    echo "• Check SSL certificate expiry monthly"
    echo "• Keep system updated: sudo apt update && sudo apt upgrade"
    echo "• Review nginx logs: sudo tail -f /var/log/nginx/jaguar_error.log"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error "This script should be run as root for complete security check"
    echo "Some checks may be incomplete without root privileges"
    echo ""
fi

main