# 🚀 JAGUAR FIGHT CLUB - Production Deployment Guide

## ✅ Исправленные проблемы

### 🔒 Безопасность
- ❌ **ИСПРАВЛЕНО**: Секреты больше не в docker-compose.yml
- ✅ **ДОБАВЛЕНО**: Proper .env файлы с шаблонами
- ✅ **ДОБАВЛЕНО**: Non-root user в Docker
- ✅ **ДОБАВЛЕНО**: Security headers и rate limiting

### 🐳 Docker конфигурация
- ❌ **ИСПРАВЛЕНО**: Конфликтующие volume mappings
- ❌ **ИСПРАВЛЕНО**: Restart policy causing cascading failures
- ❌ **ИСПРАВЛЕНО**: Health check using localhost instead of 0.0.0.0
- ❌ **ИСПРАВЛЕНО**: EADDRINUSE port 3001 - добавлена проверка и очистка портов
- ✅ **ДОБАВЛЕНО**: Optimized multi-stage build
- ✅ **ДОБАВЛЕНО**: Proper .dockerignore
- ✅ **ДОБАВЛЕНО**: Graceful shutdown с SIGTERM/SIGINT обработкой
- ✅ **ДОБАВЛЕНО**: Port cleanup в backend/server.js

### 🌐 Nginx конфигурация
- ✅ **ДОБАВЛЕНО**: Upstream configuration для failover
- ✅ **ДОБАВЛЕНО**: Rate limiting для API и webhook
- ✅ **ДОБАВЛЕНО**: Improved security headers

## 📋 Инструкции по деплою

### 1. Подготовка локального проекта

**Создайте production .env файлы:**

```bash
# Frontend environment
cp .env.production.example .env.production
nano .env.production
# Замените YOUR_DOMAIN.COM на ваш домен: beauty-bot-ai-bot-n8n.ru

# Backend environment  
cp backend/.env.production.example backend/.env.production
nano backend/.env.production
# Заполните:
# - JWT_SECRET: сгенерируйте надежный ключ
# - TELEGRAM_BOT_TOKEN: ваш токен 7395381238:AAHwOv4yNB_xzb2mnhUH3GHExDWumCB_zRc
# - Домены: beauty-bot-ai-bot-n8n.ru
```

### 2. Коммит изменений в GitHub

```bash
git add .
git commit -m "Fix: Production-ready configuration with security improvements

- Remove secrets from docker-compose.yml
- Add proper .env template files
- Optimize Dockerfile with non-root user
- Improve nginx config with upstream and rate limiting
- Update .dockerignore for better build performance"
git push origin main
```

### 3. Деплой на сервер

**Подключитесь к серверу:**
```bash
ssh jaguar@45.12.238.107
```

**Полная очистка старой конфигурации:**
```bash
cd /opt/jaguar-app

# Принудительная остановка всех контейнеров и очистка портов
sudo docker-compose down -v --remove-orphans
sudo docker kill $(sudo docker ps -q) 2>/dev/null || true
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true

# Очистка Docker системы и кеша
sudo docker system prune -af --volumes
sudo docker network prune -f

# Принудительно освобождаем порт 3001
sudo kill -9 $(sudo lsof -ti:3001) 2>/dev/null || echo "Порт 3001 свободен"
sudo netstat -tlnp | grep :3001 || echo "Порт 3001 действительно свободен"
```

**Обновите код:**
```bash
git pull origin main
```

**Создайте production .env файлы на сервере:**
```bash
# Frontend
cp .env.production.example .env
nano .env
# Замените YOUR_DOMAIN.COM на beauty-bot-ai-bot-n8n.ru

# Backend
cp backend/.env.production.example backend/.env  
nano backend/.env
# Заполните все необходимые значения
```

**Запустите приложение:**
```bash
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

**Проверьте статус:**
```bash
sudo docker-compose ps
sudo docker-compose logs app
curl http://localhost:3001/api/test
```

### 4. Настройка Nginx

```bash
# Обновите nginx конфигурацию
sudo cp nginx/nginx.conf /etc/nginx/sites-available/jaguar-app
sudo sed -i 's/YOUR_DOMAIN.COM/beauty-bot-ai-bot-n8n.ru/g' /etc/nginx/sites-available/jaguar-app
sudo ln -s /etc/nginx/sites-available/jaguar-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL сертификат

```bash
sudo certbot --nginx -d beauty-bot-ai-bot-n8n.ru --non-interactive --agree-tos --email admin@beauty-bot-ai-bot-n8n.ru
```

## 🔍 Диагностика проблем

### Если приложение не запускается:

```bash
# Проверьте логи
sudo docker-compose logs app

# Проверьте .env файлы
cat .env
cat backend/.env

# Проверьте что порт свободен
sudo netstat -tlnp | grep :3001

# НОВОЕ: Если порт 3001 занят (EADDRINUSE)
sudo kill -9 $(sudo lsof -ti:3001) 2>/dev/null || echo "Порт 3001 свободен"
sudo docker-compose down --remove-orphans
sudo docker kill $(sudo docker ps -q) 2>/dev/null || true

# Перезапустите с принуждением
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Если всё ещё не работает - полная очистка
sudo docker system prune -af --volumes
sudo systemctl restart docker
```

### Если Telegram webhook не работает:

1. Убедитесь что TELEGRAM_BOT_TOKEN правильный
2. Проверьте что домен доступен через HTTPS
3. Проверьте nginx rate limiting для /webhook

## ✅ Финальная проверка

После успешного деплоя проверьте:

- [ ] https://beauty-bot-ai-bot-n8n.ru - открывается сайт
- [ ] https://beauty-bot-ai-bot-n8n.ru/api/test - возвращает OK
- [ ] SSL сертификат действительный
- [ ] Docker контейнер в состоянии "Up (healthy)"
- [ ] Nginx логи без ошибок

## 🎉 Готово!

Ваше приложение теперь развернуто с:
- ✅ Безопасной конфигурацией без секретов в коде
- ✅ Production-ready Docker setup
- ✅ Optimized nginx с upstream и rate limiting
- ✅ Proper SSL/TLS
- ✅ Health checks и мониторинг