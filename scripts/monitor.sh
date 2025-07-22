#!/bin/bash

# 📊 JAGUAR FIGHT CLUB - Monitoring Script
# Мониторинг состояния приложения и системы

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/opt/jaguar-app"
LOG_DIR="/var/log/jaguar-app"

# Health check function
health_check() {
    echo -e "${BLUE}=== Application Health Check ===${NC}"
    
    # Check if containers are running
    echo "Docker containers status:"
    if cd "$APP_DIR" && docker-compose ps; then
        echo -e "${GREEN}✅ Containers are running${NC}"
    else
        echo -e "${RED}❌ Containers are not running${NC}"
        return 1
    fi
    
    # Check API endpoint
    echo -e "\nAPI Health:"
    if curl -f -s http://localhost:3001/api/test > /dev/null; then
        echo -e "${GREEN}✅ API is responding${NC}"
        
        # Show API response time
        response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3001/api/test)
        echo "Response time: ${response_time}s"
    else
        echo -e "${RED}❌ API is not responding${NC}"
        return 1
    fi
    
    # Check database
    echo -e "\nDatabase:"
    if docker-compose exec -T app ls database/jaguar_club.db > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database file exists${NC}"
        
        # Show database size
        db_size=$(docker-compose exec -T app du -h database/jaguar_club.db | cut -f1)
        echo "Database size: $db_size"
    else
        echo -e "${YELLOW}⚠️  Database file not found${NC}"
    fi
}

# System resources check
system_check() {
    echo -e "\n${BLUE}=== System Resources ===${NC}"
    
    # Memory usage
    echo "Memory usage:"
    free -h | grep -E "Mem|Swap"
    
    # Disk usage
    echo -e "\nDisk usage:"
    df -h / | tail -1
    
    # Docker disk usage
    echo -e "\nDocker disk usage:"
    docker system df
    
    # Load average
    echo -e "\nLoad average:"
    uptime
    
    # Top processes by memory
    echo -e "\nTop 5 processes by memory:"
    ps aux --sort=-%mem | head -6
}

# Log analysis
log_check() {
    echo -e "\n${BLUE}=== Recent Logs ===${NC}"
    
    # Application logs (last 20 lines)
    if [[ -d "$APP_DIR" ]]; then
        echo "Recent application logs:"
        cd "$APP_DIR"
        docker-compose logs --tail=20 app 2>/dev/null || echo "No application logs found"
    fi
    
    # Nginx logs
    echo -e "\nRecent nginx errors:"
    if [[ -f "/var/log/nginx/jaguar_error.log" ]]; then
        tail -10 /var/log/nginx/jaguar_error.log 2>/dev/null || echo "No nginx error logs"
    else
        echo "Nginx error log not found"
    fi
    
    # System logs for our application
    echo -e "\nSystem logs (jaguar related):"
    journalctl -u docker --since "1 hour ago" | grep -i jaguar | tail -5 || echo "No recent system logs"
}

# Network check
network_check() {
    echo -e "\n${BLUE}=== Network Status ===${NC}"
    
    # Check listening ports
    echo "Listening ports:"
    ss -tlnp | grep -E ":80|:443|:3001" || echo "No application ports found"
    
    # Check nginx status
    echo -e "\nNginx status:"
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx is running${NC}"
    else
        echo -e "${RED}❌ Nginx is not running${NC}"
    fi
    
    # Check firewall
    echo -e "\nFirewall status:"
    ufw status | head -10
}

# SSL certificate check
ssl_check() {
    local domain="${1:-}"
    
    if [[ -z "$domain" ]]; then
        echo -e "\n${YELLOW}⚠️  No domain provided for SSL check${NC}"
        return 0
    fi
    
    echo -e "\n${BLUE}=== SSL Certificate Status ===${NC}"
    
    # Check certificate expiration
    if command -v openssl >/dev/null 2>&1; then
        echo "SSL certificate for $domain:"
        echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | \
            openssl x509 -noout -dates 2>/dev/null || echo "Could not check SSL certificate"
    fi
    
    # Check certbot status
    if command -v certbot >/dev/null 2>&1; then
        echo -e "\nCertbot certificates:"
        certbot certificates 2>/dev/null | grep -E "Certificate Name|Expiry Date" || echo "No certbot certificates found"
    fi
}

# Security check
security_check() {
    echo -e "\n${BLUE}=== Security Status ===${NC}"
    
    # Check fail2ban
    if command -v fail2ban-client >/dev/null 2>&1; then
        echo "Fail2ban status:"
        fail2ban-client status 2>/dev/null || echo "Fail2ban not configured"
    fi
    
    # Check for failed login attempts
    echo -e "\nRecent failed login attempts:"
    grep "Failed password" /var/log/auth.log 2>/dev/null | tail -5 || echo "No recent failed attempts"
    
    # Check running processes
    echo -e "\nDocker containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Show all stats
show_all() {
    echo -e "${GREEN}🔍 JAGUAR FIGHT CLUB - System Monitor${NC}"
    echo "$(date)"
    echo "======================================="
    
    health_check || true
    system_check
    network_check
    log_check
    ssl_check "$1"
    security_check
    
    echo -e "\n${GREEN}✅ Monitoring complete!${NC}"
}

# Quick status
quick_status() {
    echo -e "${GREEN}📊 Quick Status${NC}"
    
    # API status
    if curl -f -s http://localhost:3001/api/test > /dev/null; then
        echo -e "API: ${GREEN}✅ Online${NC}"
    else
        echo -e "API: ${RED}❌ Offline${NC}"
    fi
    
    # Nginx status
    if systemctl is-active --quiet nginx; then
        echo -e "Nginx: ${GREEN}✅ Running${NC}"
    else
        echo -e "Nginx: ${RED}❌ Stopped${NC}"
    fi
    
    # Docker status
    if docker-compose -f "$APP_DIR/docker-compose.yml" ps | grep -q "Up"; then
        echo -e "Docker: ${GREEN}✅ Containers running${NC}"
    else
        echo -e "Docker: ${RED}❌ Containers not running${NC}"
    fi
    
    # Load average
    load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    echo "Load: $load"
    
    # Memory usage
    mem_usage=$(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')
    echo "Memory: $mem_usage"
}

# Help
show_help() {
    echo "Usage: $0 [OPTIONS] [DOMAIN]"
    echo ""
    echo "Monitor JAGUAR FIGHT CLUB application"
    echo ""
    echo "Options:"
    echo "  -q, --quick     Quick status check"
    echo "  -h, --help      Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                          # Full monitoring"
    echo "  $0 -q                       # Quick status"
    echo "  $0 jaguar-club.com          # Include SSL check for domain"
}

# Main function
case "${1:-}" in
    -q|--quick)
        quick_status
        ;;
    -h|--help)
        show_help
        ;;
    *)
        show_all "$1"
        ;;
esac