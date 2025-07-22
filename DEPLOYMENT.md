# 🚀 JAGUAR FIGHT CLUB - Deployment Guide

Полное руководство по развертыванию приложения на VPS сервере с автоматической интеграцией GitHub.

## 📋 Содержание

1. [Требования](#требования)
2. [Подготовка VPS](#подготовка-vps)
3. [Настройка GitHub Actions](#настройка-github-actions)
4. [Развертывание приложения](#развертывание-приложения)
5. [Настройка SSL](#настройка-ssl)
6. [Мониторинг и безопасность](#мониторинг-и-безопасность)
7. [Обслуживание](#обслуживание)
8. [Решение проблем](#решение-проблем)

---

## 🔧 Требования

### VPS сервер
- **OS**: Ubuntu 20.04+ или Debian 11+
- **RAM**: Минимум 2GB (рекомендуется 4GB)
- **CPU**: 2+ ядра
- **Disk**: 20GB+ свободного места
- **Network**: Публичный IP адрес

### Домен (опционально)
- Доменное имя, указывающее на IP вашего VPS
- Доступ к настройкам DNS

### GitHub
- Репозиторий с правами администратора
- GitHub Actions включены

---

## 🖥️ Подготовка VPS

### 1. Подключение к серверу
```bash
ssh root@YOUR_SERVER_IP
```

### 2. Обновление системы
```bash
apt update && apt upgrade -y
```

### 3. Создание пользователя (рекомендуется)
```bash
adduser jaguar
usermod -aG sudo jaguar
usermod -aG docker jaguar
su - jaguar
```

### 4. Клонирование репозитория
```bash
sudo mkdir -p /opt
sudo chown $USER:$USER /opt
cd /opt
git clone https://github.com/YOUR_USERNAME/jaguar_project.git jaguar-app
cd jaguar-app
```

---

## ⚙️ Настройка GitHub Actions

### 1. Создание SSH ключа для деплоя
На VPS сервере:
```bash
ssh-keygen -t ed25519 -C "deploy@jaguar-app" -f ~/.ssh/deploy_key
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/deploy_key  # Скопируйте приватный ключ
```

### 2. Настройка GitHub Secrets
В настройках репозитория GitHub → Settings → Secrets and variables → Actions:

- `VPS_HOST`: IP адрес вашего VPS
- `VPS_USER`: Имя пользователя (например: jaguar)
- `VPS_SSH_KEY`: Приватный SSH ключ (содержимое deploy_key)
- `VPS_PATH`: Путь к приложению (/opt/jaguar-app)

### 3. Переменные окружения (опционально)
- `TELEGRAM_BOT_TOKEN`: Токен Telegram бота
- `JWT_SECRET`: Секретный ключ для JWT
- `DOMAIN`: Ваш домен (example.com)

---

## 🚀 Развертывание приложения

### 1. Автоматический деплой (рекомендуется)
```bash
cd /opt/jaguar-app
sudo ./scripts/deploy.sh your-domain.com
```

Скрипт автоматически:
- Установит все зависимости
- Настроит Docker и Docker Compose
- Настроит nginx
- Настроит firewall
- Запустит приложение

### 2. Ручной деплой
Если автоматический скрипт не подходит:

#### Установка зависимостей
```bash
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl wget ufw fail2ban
sudo systemctl enable docker nginx
sudo systemctl start docker nginx
```

#### Настройка firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

#### Настройка приложения
```bash
cd /opt/jaguar-app

# Копирование production конфигураций
cp .env.production .env
cp backend/.env.production backend/.env

# Редактирование конфигураций
nano .env              # Настройте домен и параметры
nano backend/.env      # Настройте JWT_SECRET и TELEGRAM_BOT_TOKEN

# Запуск приложения
docker-compose build
docker-compose up -d
```

#### Настройка nginx
```bash
# Копирование конфигурации nginx
sudo cp nginx/nginx.conf /etc/nginx/sites-available/jaguar-fight-club
sudo sed -i 's/YOUR_DOMAIN.COM/your-domain.com/g' /etc/nginx/sites-available/jaguar-fight-club
sudo ln -s /etc/nginx/sites-available/jaguar-fight-club /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Настройка SSL

### Автоматическая настройка (Let's Encrypt)
```bash
sudo certbot --nginx -d your-domain.com --non-interactive --agree-tos --email admin@your-domain.com
```

### Автоматическое обновление
```bash
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Проверка SSL
```bash
curl -I https://your-domain.com
```

---

## 🔍 Мониторинг и безопасность

### 1. Настройка мониторинга
```bash
# Создание задания cron для мониторинга
echo "*/15 * * * * /opt/jaguar-app/scripts/monitor.sh -q >> /var/log/jaguar-monitor.log" | sudo crontab -

# Ручная проверка статуса
sudo /opt/jaguar-app/scripts/monitor.sh
```

### 2. Настройка fail2ban
```bash
# Копирование конфигурации fail2ban
sudo cp config/fail2ban/nginx-jaguar.conf /etc/fail2ban/jail.d/
sudo sed -i 's/YOUR_DOMAIN.COM/your-domain.com/g' /etc/fail2ban/jail.d/nginx-jaguar.conf
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

### 3. Настройка systemd службы
```bash
sudo cp config/systemd/jaguar-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable jaguar-app
sudo systemctl start jaguar-app
```

### 4. Audit безопасности
```bash
# Еженедельный аудит
sudo /opt/jaguar-app/scripts/security-audit.sh
```

---

## 🔧 Обслуживание

### Резервное копирование

#### Создание backup
```bash
sudo /opt/jaguar-app/scripts/backup.sh
```

#### Просмотр backup'ов
```bash
sudo /opt/jaguar-app/scripts/backup.sh list
```

#### Восстановление из backup
```bash
sudo /opt/jaguar-app/scripts/backup.sh restore YYYYMMDD_HHMMSS
```

#### Автоматические backup'ы
```bash
# Ежедневные backup'ы в 2:00
echo "0 2 * * * /opt/jaguar-app/scripts/backup.sh >> /var/log/jaguar-backup.log 2>&1" | sudo crontab -
```

### Обновление приложения

#### Автоматическое (через GitHub Actions)
1. Push код в главную ветку
2. GitHub Actions автоматически развернет обновление

#### Ручное обновление
```bash
cd /opt/jaguar-app
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

### Логи и мониторинг

#### Просмотр логов приложения
```bash
cd /opt/jaguar-app
docker-compose logs -f app
```

#### Просмотр логов nginx
```bash
sudo tail -f /var/log/nginx/jaguar_access.log
sudo tail -f /var/log/nginx/jaguar_error.log
```

#### Проверка статуса сервисов
```bash
sudo systemctl status nginx docker
sudo /opt/jaguar-app/scripts/monitor.sh -q
```

---

## 🐛 Решение проблем

### Приложение не запускается

#### 1. Проверка Docker контейнеров
```bash
cd /opt/jaguar-app
docker-compose ps
docker-compose logs app
```

#### 2. Проверка портов
```bash
sudo netstat -tlnp | grep -E ':80|:443|:3001'
```

#### 3. Перезапуск приложения
```bash
cd /opt/jaguar-app
docker-compose down
docker-compose up -d
```

### SSL проблемы

#### 1. Проверка сертификата
```bash
sudo certbot certificates
```

#### 2. Обновление сертификата
```bash
sudo certbot renew --force-renewal -d your-domain.com
sudo systemctl reload nginx
```

### Проблемы с nginx

#### 1. Проверка конфигурации
```bash
sudo nginx -t
```

#### 2. Перезапуск nginx
```bash
sudo systemctl restart nginx
```

#### 3. Проверка логов
```bash
sudo tail -f /var/log/nginx/error.log
```

### База данных проблемы

#### 1. Проверка файла БД
```bash
cd /opt/jaguar-app
docker-compose exec app ls -la database/
```

#### 2. Восстановление из backup
```bash
sudo /opt/jaguar-app/scripts/backup.sh list
sudo /opt/jaguar-app/scripts/backup.sh restore BACKUP_DATE
```

### Проблемы с GitHub Actions

#### 1. Проверка SSH соединения
```bash
ssh -i ~/.ssh/deploy_key $VPS_USER@$VPS_HOST
```

#### 2. Проверка прав доступа
```bash
ls -la /opt/jaguar-app/
sudo chown -R $USER:$USER /opt/jaguar-app/
```

---

## 📊 Команды для мониторинга

### Быстрая проверка статуса
```bash
sudo /opt/jaguar-app/scripts/monitor.sh -q
```

### Полный мониторинг
```bash
sudo /opt/jaguar-app/scripts/monitor.sh your-domain.com
```

### Проверка безопасности
```bash
sudo /opt/jaguar-app/scripts/security-audit.sh
```

### Управление backup'ами
```bash
sudo /opt/jaguar-app/scripts/backup.sh          # Создать backup
sudo /opt/jaguar-app/scripts/backup.sh list     # Список backup'ов
sudo /opt/jaguar-app/scripts/backup.sh cleanup  # Очистка старых backup'ов
```

---

## 🎯 Полезные ссылки

- **Приложение**: https://your-domain.com
- **API**: https://your-domain.com/api
- **Health Check**: https://your-domain.com/api/test
- **Telegram Bot**: Настроен через webhook на `/webhook`

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs -f`
2. Запустите мониторинг: `sudo ./scripts/monitor.sh`
3. Проверьте безопасность: `sudo ./scripts/security-audit.sh`
4. Создайте backup: `sudo ./scripts/backup.sh`

---

## 🏆 Готовый чеклист для деплоя

- [ ] VPS настроен и доступен по SSH
- [ ] Домен настроен (A запись указывает на IP)
- [ ] GitHub Secrets настроены
- [ ] Запущен скрипт деплоя: `sudo ./scripts/deploy.sh your-domain.com`
- [ ] SSL сертификат установлен
- [ ] Fail2ban настроен
- [ ] Backup'ы настроены
- [ ] Мониторинг настроен
- [ ] Проверен доступ к приложению
- [ ] Протестирован CI/CD pipeline

**Поздравляем! 🎉 JAGUAR FIGHT CLUB успешно развернут!**