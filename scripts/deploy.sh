#!/bin/bash

# 🚀 JAGUAR FIGHT CLUB - VPS Deployment Script
# Автоматический деплой приложения на VPS сервер

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="jaguar-fight-club"
APP_DIR="/opt/jaguar-app"
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
LOG_FILE="/var/log/jaguar-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    apt-get update
    apt-get install -y \
        docker.io \
        docker-compose \
        nginx \
        certbot \
        python3-certbot-nginx \
        git \
        curl \
        wget \
        ufw \
        fail2ban
    
    # Start and enable services
    systemctl start docker
    systemctl enable docker
    systemctl start nginx
    systemctl enable nginx
    
    success "System dependencies installed"
}

# Setup application directory
setup_app_directory() {
    log "Setting up application directory..."
    
    # Create app directory
    mkdir -p "$APP_DIR"
    
    # Create logs directory
    mkdir -p /var/log/jaguar-app
    
    success "Application directory created: $APP_DIR"
}

# Configure firewall
configure_firewall() {
    log "Configuring UFW firewall..."
    
    # Reset firewall to defaults
    ufw --force reset
    
    # Allow SSH (be careful not to lock yourself out!)
    ufw allow ssh
    ufw allow 22
    
    # Allow HTTP and HTTPS
    ufw allow 80
    ufw allow 443
    
    # Enable firewall
    ufw --force enable
    
    success "Firewall configured"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    local domain="$1"
    
    if [[ -z "$domain" ]]; then
        warning "No domain provided, skipping SSL setup"
        return 0
    fi
    
    log "Setting up SSL certificate for $domain..."
    
    # Get SSL certificate
    certbot --nginx -d "$domain" --non-interactive --agree-tos --email "admin@$domain" --redirect
    
    # Setup auto-renewal
    crontab -l | grep -q 'certbot renew' || {
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    }
    
    success "SSL certificate configured for $domain"
}

# Configure nginx
configure_nginx() {
    local domain="${1:-YOUR_DOMAIN.COM}"
    
    log "Configuring nginx for $domain..."
    
    # Copy nginx configuration
    if [[ -f "$APP_DIR/nginx/nginx.conf" ]]; then
        # Replace domain placeholder
        sed "s/YOUR_DOMAIN.COM/$domain/g" "$APP_DIR/nginx/nginx.conf" > "$NGINX_SITES/$APP_NAME"
        
        # Enable site
        ln -sf "$NGINX_SITES/$APP_NAME" "$NGINX_ENABLED/$APP_NAME"
        
        # Remove default site
        rm -f "$NGINX_ENABLED/default"
        
        # Test nginx configuration
        nginx -t || error "Nginx configuration test failed"
        
        # Reload nginx
        systemctl reload nginx
        
        success "Nginx configured for $domain"
    else
        warning "Nginx configuration file not found, using default"
    fi
}

# Deploy application
deploy_app() {
    log "Deploying application..."
    
    cd "$APP_DIR"
    
    # Copy production environment files
    if [[ -f ".env.production" ]]; then
        cp .env.production .env
        log "Frontend production environment configured"
    fi
    
    if [[ -f "backend/.env.production" ]]; then
        cp backend/.env.production backend/.env
        log "Backend production environment configured"
    fi
    
    # Build and start application
    log "Building Docker containers..."
    docker-compose down --remove-orphans || true
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for application to start
    log "Waiting for application to start..."
    sleep 30
    
    # Health check
    if curl -f http://localhost:3001/api/test > /dev/null 2>&1; then
        success "Application deployed and healthy!"
    else
        error "Application deployment failed - health check failed"
    fi
}

# Main deployment function
main() {
    local domain="${1:-}"
    
    log "🚀 Starting JAGUAR FIGHT CLUB deployment..."
    
    check_root
    install_dependencies
    setup_app_directory
    configure_firewall
    
    if [[ -n "$domain" ]]; then
        configure_nginx "$domain"
        setup_ssl "$domain"
    else
        warning "No domain provided - using localhost configuration"
        configure_nginx
    fi
    
    deploy_app
    
    success "🎉 Deployment completed successfully!"
    log "Application available at: http${domain:+s}://${domain:-localhost}"
    log "API endpoint: http${domain:+s}://${domain:-localhost}/api"
    
    # Show status
    echo -e "\n${GREEN}=== Deployment Status ===${NC}"
    echo "Docker containers:"
    docker-compose ps
    echo -e "\nNginx status:"
    systemctl status nginx --no-pager -l
    echo -e "\nFirewall status:"
    ufw status
}

# Help function
show_help() {
    echo "Usage: $0 [DOMAIN]"
    echo ""
    echo "Deploy JAGUAR FIGHT CLUB to VPS server"
    echo ""
    echo "Arguments:"
    echo "  DOMAIN    Your domain name (optional, e.g., example.com)"
    echo ""
    echo "Examples:"
    echo "  $0                          # Deploy with localhost"
    echo "  $0 jaguar-club.com         # Deploy with custom domain"
    echo ""
    echo "Prerequisites:"
    echo "  - Run as root (sudo)"
    echo "  - VPS with Ubuntu 20.04+"
    echo "  - Domain pointing to VPS IP (if using custom domain)"
}

# Parse arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac