#!/bin/bash

# 💾 JAGUAR FIGHT CLUB - Backup Script
# Автоматический backup базы данных и файлов приложения

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_DIR="/opt/jaguar-app"
BACKUP_DIR="/opt/backups/jaguar-app"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Backup database
backup_database() {
    log "Starting database backup..."
    
    if [[ ! -d "$APP_DIR" ]]; then
        error "Application directory not found: $APP_DIR"
    fi
    
    cd "$APP_DIR"
    
    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        error "Application containers are not running"
    fi
    
    # Create database backup
    local db_backup="$BACKUP_DIR/database_$DATE.db"
    
    # Copy database file from container
    if docker-compose exec -T app cp database/jaguar_club.db /tmp/backup.db; then
        docker cp $(docker-compose ps -q app):/tmp/backup.db "$db_backup"
        
        # Verify backup
        if [[ -f "$db_backup" && -s "$db_backup" ]]; then
            local backup_size=$(du -h "$db_backup" | cut -f1)
            success "Database backup created: $db_backup ($backup_size)"
        else
            error "Database backup failed or is empty"
        fi
    else
        error "Failed to create database backup"
    fi
    
    # Create compressed backup
    gzip "$db_backup"
    success "Database backup compressed: ${db_backup}.gz"
}

# Backup application files
backup_files() {
    log "Starting application files backup..."
    
    local files_backup="$BACKUP_DIR/app_files_$DATE.tar.gz"
    
    # Create tar archive excluding unnecessary files
    tar -czf "$files_backup" \
        -C "$APP_DIR" \
        --exclude='node_modules' \
        --exclude='logs' \
        --exclude='*.log' \
        --exclude='.git' \
        --exclude='dist' \
        --exclude='build' \
        . 2>/dev/null || true
    
    if [[ -f "$files_backup" && -s "$files_backup" ]]; then
        local backup_size=$(du -h "$files_backup" | cut -f1)
        success "Application files backup created: $files_backup ($backup_size)"
    else
        error "Application files backup failed"
    fi
}

# Backup environment files
backup_env() {
    log "Starting environment files backup..."
    
    local env_backup="$BACKUP_DIR/env_$DATE.tar.gz"
    
    # Create archive of environment files
    tar -czf "$env_backup" \
        -C "$APP_DIR" \
        .env \
        backend/.env \
        2>/dev/null || true
    
    if [[ -f "$env_backup" ]]; then
        success "Environment files backup created: $env_backup"
    else
        log "No environment files to backup"
    fi
}

# Create full backup
full_backup() {
    log "🗄️  Starting full backup..."
    
    backup_database
    backup_files
    backup_env
    
    # Create backup manifest
    local manifest="$BACKUP_DIR/manifest_$DATE.txt"
    {
        echo "JAGUAR FIGHT CLUB - Backup Manifest"
        echo "Created: $(date)"
        echo "========================================"
        echo ""
        echo "Files in this backup:"
        ls -lh "$BACKUP_DIR"/*_$DATE* 2>/dev/null || echo "No backup files found"
        echo ""
        echo "Application status at backup time:"
        cd "$APP_DIR" && docker-compose ps 2>/dev/null || echo "Could not get container status"
        echo ""
        echo "System info:"
        echo "Hostname: $(hostname)"
        echo "IP: $(hostname -I | awk '{print $1}')"
        echo "Disk usage: $(df -h / | tail -1)"
        echo "Memory usage: $(free -h | grep Mem)"
    } > "$manifest"
    
    success "Full backup completed! Manifest: $manifest"
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    find "$BACKUP_DIR" -name "*.db.gz" -mtime +$RETENTION_DAYS -type f -exec rm {} \; -exec echo "Deleted: {}" \; | while read line; do
        ((deleted_count++))
        echo "$line"
    done
    
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -type f -exec rm {} \; -exec echo "Deleted: {}" \;
    find "$BACKUP_DIR" -name "*.txt" -mtime +$RETENTION_DAYS -type f -exec rm {} \; -exec echo "Deleted: {}" \;
    
    success "Old backups cleanup completed"
}

# Restore from backup
restore_backup() {
    local backup_date="$1"
    
    if [[ -z "$backup_date" ]]; then
        error "Please specify backup date (format: YYYYMMDD_HHMMSS)"
    fi
    
    log "🔄 Restoring from backup: $backup_date"
    
    local db_backup="$BACKUP_DIR/database_${backup_date}.db.gz"
    
    if [[ ! -f "$db_backup" ]]; then
        error "Database backup not found: $db_backup"
    fi
    
    # Stop application
    log "Stopping application..."
    cd "$APP_DIR"
    docker-compose down
    
    # Restore database
    log "Restoring database..."
    gunzip -c "$db_backup" > "/tmp/restore_db.db"
    docker-compose up -d
    sleep 10
    
    # Copy database to container
    docker cp "/tmp/restore_db.db" $(docker-compose ps -q app):/app/database/jaguar_club.db
    
    # Restart application
    docker-compose restart
    
    rm -f "/tmp/restore_db.db"
    
    success "Database restored from backup: $backup_date"
}

# List available backups
list_backups() {
    log "📋 Available backups:"
    echo ""
    
    if [[ -d "$BACKUP_DIR" ]]; then
        echo "Database backups:"
        ls -lht "$BACKUP_DIR"/database_*.db.gz 2>/dev/null | head -10 || echo "No database backups found"
        
        echo ""
        echo "Application backups:"
        ls -lht "$BACKUP_DIR"/app_files_*.tar.gz 2>/dev/null | head -10 || echo "No application backups found"
        
        echo ""
        echo "Total backup size:"
        du -sh "$BACKUP_DIR" 2>/dev/null || echo "Could not calculate backup size"
    else
        echo "No backup directory found: $BACKUP_DIR"
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Backup and restore JAGUAR FIGHT CLUB application"
    echo ""
    echo "Options:"
    echo "  backup          Create full backup (default)"
    echo "  restore DATE    Restore from backup (format: YYYYMMDD_HHMMSS)"
    echo "  list           List available backups"
    echo "  cleanup        Clean old backups"
    echo "  -h, --help     Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                          # Create full backup"
    echo "  $0 backup                   # Create full backup"
    echo "  $0 restore 20240101_120000  # Restore from specific backup"
    echo "  $0 list                     # List available backups"
    echo "  $0 cleanup                  # Remove old backups"
    echo ""
    echo "Configuration:"
    echo "  Backup directory: $BACKUP_DIR"
    echo "  Retention period: $RETENTION_DAYS days"
}

# Main function
main() {
    case "${1:-backup}" in
        backup)
            full_backup
            cleanup_old_backups
            ;;
        restore)
            restore_backup "${2:-}"
            ;;
        list)
            list_backups
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        -h|--help)
            show_help
            ;;
        *)
            error "Unknown option: $1. Use -h for help."
            ;;
    esac
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root (use sudo)"
fi

main "$@"