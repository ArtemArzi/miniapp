#!/bin/bash

# 🚀 JAGUAR FIGHT CLUB - Quick Setup Script
# Быстрая настройка для локальной разработки или VPS

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root for VPS setup
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log "Running as root - VPS setup mode"
        return 0
    else
        log "Running as user - Development setup mode"
        return 1
    fi
}

# Development setup
dev_setup() {
    log "Setting up for development..."
    
    # Check if pnpm is installed
    if ! command -v pnpm >/dev/null 2>&1; then
        warning "pnpm not found. Installing..."
        npm install -g pnpm
    fi
    
    # Install frontend dependencies
    log "Installing frontend dependencies..."
    pnpm install
    
    # Install backend dependencies
    log "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Copy environment files if they don't exist
    if [[ ! -f ".env" ]]; then
        if [[ -f ".env.example" ]]; then
            cp .env.example .env
            success "Created .env from .env.example"
        else
            warning "No .env.example found"
        fi
    fi
    
    if [[ ! -f "backend/.env" ]]; then
        if [[ -f "backend/.env.example" ]]; then
            cp backend/.env.example backend/.env
            success "Created backend/.env from backend/.env.example"
        else
            warning "No backend/.env.example found"
        fi
    fi
    
    success "Development setup completed!"
    echo ""
    echo "To start development:"
    echo "  Frontend: pnpm dev"
    echo "  Backend:  cd backend && npm run dev"
}

# Production setup
prod_setup() {
    local domain="${1:-}"
    
    log "Setting up for production..."
    
    if [[ -z "$domain" ]]; then
        read -p "Enter your domain (or press Enter for localhost): " domain
    fi
    
    if [[ -z "$domain" ]]; then
        domain="localhost"
        warning "Using localhost - SSL will be disabled"
    fi
    
    log "Setting up for domain: $domain"
    
    # Copy production environment files
    if [[ -f ".env.production" ]]; then
        cp .env.production .env
        sed -i "s/YOUR_DOMAIN.COM/$domain/g" .env
        success "Production frontend environment configured"
    fi
    
    if [[ -f "backend/.env.production" ]]; then
        cp backend/.env.production backend/.env
        
        # Generate JWT secret if it's still the default
        if grep -q "CHANGE_THIS" backend/.env; then
            jwt_secret=$(openssl rand -hex 32)
            sed -i "s/CHANGE_THIS_IN_PRODUCTION_TO_SECURE_RANDOM_STRING/$jwt_secret/g" backend/.env
        fi
        
        sed -i "s/YOUR_DOMAIN.COM/$domain/g" backend/.env
        success "Production backend environment configured"
    fi
    
    # Make scripts executable
    chmod +x scripts/*.sh
    
    # Run full deployment if requested
    read -p "Run full VPS deployment now? (y/N): " deploy_now
    if [[ "$deploy_now" =~ ^[Yy]$ ]]; then
        ./scripts/deploy.sh "$domain"
    else
        success "Production setup completed!"
        echo ""
        echo "Next steps:"
        echo "1. Review .env and backend/.env files"
        echo "2. Run: sudo ./scripts/deploy.sh $domain"
        echo "3. Set up monitoring: sudo ./scripts/monitor.sh"
    fi
}

# Docker setup
docker_setup() {
    log "Setting up Docker environment..."
    
    # Check if Docker is installed
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker not found. Please install Docker first."
        return 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "docker-compose not found. Please install docker-compose first."
        return 1
    fi
    
    # Copy production environment for Docker
    if [[ -f ".env.production" ]]; then
        cp .env.production .env
    fi
    
    if [[ -f "backend/.env.production" ]]; then
        cp backend/.env.production backend/.env
    fi
    
    # Build and start containers
    log "Building Docker containers..."
    docker-compose down --remove-orphans || true
    docker-compose build
    docker-compose up -d
    
    # Wait for application to start
    log "Waiting for application to start..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:3001/api/test >/dev/null 2>&1; then
        success "Docker setup completed! Application is running."
        echo "Access: http://localhost:3001"
    else
        error "Health check failed. Check logs: docker-compose logs"
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS] [DOMAIN]"
    echo ""
    echo "Quick setup script for JAGUAR FIGHT CLUB"
    echo ""
    echo "Options:"
    echo "  dev              Development setup"
    echo "  prod [DOMAIN]    Production setup"
    echo "  docker           Docker setup"
    echo "  -h, --help       Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # Development setup"
    echo "  $0 docker                 # Docker setup"
    echo "  $0 prod                   # Production setup (interactive)"
    echo "  $0 prod jaguar-club.com   # Production setup with domain"
    echo ""
    echo "For full VPS deployment, use: sudo ./scripts/deploy.sh [DOMAIN]"
}

# Main function
main() {
    echo -e "${GREEN}🥊 JAGUAR FIGHT CLUB - Quick Setup${NC}"
    echo "======================================"
    echo ""
    
    case "${1:-}" in
        dev|development)
            dev_setup
            ;;
        prod|production)
            if check_root; then
                prod_setup "${2:-}"
            else
                error "Production setup requires root privileges. Use: sudo $0 prod"
            fi
            ;;
        docker)
            docker_setup
            ;;
        -h|--help)
            show_help
            ;;
        "")
            # Interactive mode
            echo "Select setup type:"
            echo "1) Development"
            echo "2) Docker"
            echo "3) Production (requires root)"
            echo "4) Help"
            echo ""
            read -p "Choice (1-4): " choice
            
            case $choice in
                1) dev_setup ;;
                2) docker_setup ;;
                3) 
                    if check_root; then
                        prod_setup
                    else
                        error "Production setup requires root privileges. Use: sudo $0"
                    fi
                    ;;
                4) show_help ;;
                *) error "Invalid choice" ;;
            esac
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"