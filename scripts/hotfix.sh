#!/bin/bash

# 🚨 JAGUAR FIGHT CLUB - Hotfix Script
# Быстрое исправление критических ошибок на production

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/opt/jaguar-app"

log() {
    echo -e "${BLUE}[HOTFIX]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if in app directory
check_location() {
    if [[ ! -d "$APP_DIR" ]]; then
        error "Application directory not found: $APP_DIR"
    fi
    
    cd "$APP_DIR"
}

# Create backup before hotfix
create_backup() {
    local backup_name="hotfix_backup_$(date +%Y%m%d_%H%M%S)"
    
    log "Creating backup before hotfix..."
    git stash push -m "$backup_name" || true
    
    # Also create file backup
    sudo /opt/jaguar-app/scripts/backup.sh
    
    success "Backup created: $backup_name"
}

# Quick restart application
restart_app() {
    log "Restarting application..."
    
    # Method 1: Docker compose restart
    if docker-compose restart; then
        success "Application restarted via docker-compose"
    # Method 2: Systemd service restart  
    elif systemctl restart jaguar-app; then
        success "Application restarted via systemd"
    else
        error "Failed to restart application"
    fi
    
    # Wait for startup
    sleep 10
    
    # Health check
    if curl -f http://localhost:3001/api/test > /dev/null 2>&1; then
        success "Health check passed"
    else
        error "Health check failed - application may not be working"
    fi
}

# Rollback to previous version
rollback() {
    local commits_back="${1:-1}"
    
    warning "Rolling back $commits_back commit(s)..."
    
    # Show recent commits
    echo "Recent commits:"
    git log --oneline -5
    echo ""
    
    # Confirm rollback
    read -p "Confirm rollback to HEAD~$commits_back? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log "Rollback cancelled"
        return 0
    fi
    
    # Create backup
    create_backup
    
    # Rollback
    git reset --hard "HEAD~$commits_back"
    
    # Restart
    restart_app
    
    success "Rolled back $commits_back commit(s)"
    
    # Show current status  
    echo "Current commit:"
    git log --oneline -1
}

# Pull latest changes and restart
update_and_restart() {
    log "Pulling latest changes from repository..."
    
    # Stash any local changes
    git stash || true
    
    # Pull latest
    git pull origin main
    
    # Rebuild if needed
    if [[ "${1:-}" == "--rebuild" ]]; then
        log "Rebuilding Docker containers..."
        docker-compose build --no-cache
    fi
    
    # Restart
    restart_app
    
    success "Updated to latest version"
    git log --oneline -1
}

# Quick fix workflow
quick_fix() {
    log "Starting quick fix workflow..."
    
    # Create backup
    create_backup
    
    # Check current status
    log "Current application status:"
    sudo /opt/jaguar-app/scripts/monitor.sh -q || true
    
    echo ""
    log "Quick fix options:"
    echo "1. Edit files directly"
    echo "2. Pull latest from repository"  
    echo "3. Restart application only"
    echo "4. Rollback to previous version"
    echo "5. View logs"
    echo "6. Full system check"
    echo ""
    
    read -p "Select option (1-6): " option
    
    case $option in
        1)
            echo "Common files to edit:"
            echo "- Frontend: src/components/, src/services/"
            echo "- Backend: backend/src/routes/, backend/.env"
            echo "- Config: .env, nginx/nginx.conf"
            echo ""
            read -p "Enter file path to edit: " file_path
            if [[ -f "$file_path" ]]; then
                nano "$file_path"
                restart_app
            else
                error "File not found: $file_path"
            fi
            ;;
        2)
            update_and_restart --rebuild
            ;;
        3)
            restart_app
            ;;
        4)
            read -p "How many commits back to rollback? (default: 1): " commits
            rollback "${commits:-1}"
            ;;
        5)
            echo "Application logs:"
            docker-compose logs --tail=50 app
            ;;
        6)
            sudo /opt/jaguar-app/scripts/monitor.sh
            ;;
        *)
            error "Invalid option"
            ;;
    esac
}

# Emergency stop
emergency_stop() {
    warning "Emergency stop - shutting down application..."
    
    docker-compose down || true
    systemctl stop jaguar-app || true
    systemctl stop nginx || true
    
    success "Application stopped"
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Quick hotfix commands for JAGUAR FIGHT CLUB"
    echo ""
    echo "Commands:"
    echo "  restart         Restart application only"
    echo "  update          Pull latest and restart"
    echo "  rollback [N]    Rollback N commits (default: 1)"
    echo "  fix             Interactive quick fix mode"
    echo "  stop            Emergency stop"
    echo "  logs            Show recent logs"
    echo "  status          Show application status"
    echo "  -h, --help      Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 restart           # Just restart app"
    echo "  $0 update            # Pull latest code and restart"
    echo "  $0 rollback 2        # Rollback 2 commits"
    echo "  $0 fix               # Interactive fix mode"
    echo ""
    echo "For full deployment: sudo ./scripts/deploy.sh"
    echo "For monitoring: sudo ./scripts/monitor.sh"
}

# Main function
main() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
    
    check_location
    
    case "${1:-fix}" in
        restart)
            restart_app
            ;;
        update)
            update_and_restart --rebuild
            ;;
        rollback)
            rollback "${2:-1}"
            ;;
        fix)
            quick_fix
            ;;
        stop|emergency)
            emergency_stop
            ;;
        logs)
            docker-compose logs --tail=100 app
            ;;
        status)
            sudo /opt/jaguar-app/scripts/monitor.sh -q
            ;;
        -h|--help)
            show_help
            ;;
        *)
            error "Unknown command: $1. Use -h for help."
            ;;
    esac
}

main "$@"