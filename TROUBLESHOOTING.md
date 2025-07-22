# 🛠️ JAGUAR FIGHT CLUB - Руководство по устранению неполадок

Полное руководство по исправлению ошибок и обслуживанию приложения после развертывания.

## 📋 Содержание

1. [Быстрые команды](#быстрые-команды)
2. [Процессы исправления ошибок](#процессы-исправления-ошибок)
3. [Диагностика проблем](#диагностика-проблем)
4. [Типичные проблемы и решения](#типичные-проблемы-и-решения)
5. [Экстренные процедуры](#экстренные-процедуры)
6. [Мониторинг и логи](#мониторинг-и-логи)

---

## ⚡ Быстрые команды

### 🔧 Основные команды исправления
```bash
# Интерактивное меню исправлений
sudo /opt/jaguar-app/scripts/hotfix.sh fix

# Перезапуск приложения
sudo /opt/jaguar-app/scripts/hotfix.sh restart

# Обновление кода с GitHub
sudo /opt/jaguar-app/scripts/hotfix.sh update

# Откат к предыдущей версии
sudo /opt/jaguar-app/scripts/hotfix.sh rollback

# Экстренная остановка
sudo /opt/jaguar-app/scripts/hotfix.sh stop
```

### 📊 Диагностика
```bash
# Быстрая проверка статуса
sudo /opt/jaguar-app/scripts/monitor.sh -q

# Полная диагностика
sudo /opt/jaguar-app/scripts/monitor.sh your-domain.com

# Просмотр логов
sudo /opt/jaguar-app/scripts/hotfix.sh logs

# Аудит безопасности
sudo /opt/jaguar-app/scripts/security-audit.sh
```

### 💾 Резервное копирование
```bash
# Создать backup
sudo /opt/jaguar-app/scripts/backup.sh

# Список доступных backup'ов
sudo /opt/jaguar-app/scripts/backup.sh list

# Восстановить из backup
sudo /opt/jaguar-app/scripts/backup.sh restore YYYYMMDD_HHMMSS
```

---

## 🔄 Процессы исправления ошибок

### 🟢 Стандартный процесс (Рекомендуемый - 90% случаев)

**GitHub → VPS автоматический деплой:**

1. **Исправление локально**
   ```bash
   # В вашей локальной разработке
   git add .
   git commit -m "fix: исправление ошибки авторизации"
   git push origin main
   ```

2. **Автоматический деплой**
   - GitHub Actions автоматически запускается
   - Код тестируется и собирается
   - Развертывается на VPS
   - Выполняются health checks

3. **Проверка результата**
   ```bash
   # На VPS проверьте статус
   sudo /opt/jaguar-app/scripts/monitor.sh -q
   ```

### 🚨 Экстренное исправление (Критичные ошибки)

**Когда сайт не работает и нужно исправить СРОЧНО:**

1. **Подключение к серверу**
   ```bash
   ssh your-vps-server
   cd /opt/jaguar-app
   ```

2. **Быстрое исправление**
   ```bash
   # Интерактивное меню
   sudo /opt/jaguar-app/scripts/hotfix.sh fix
   
   # Или прямое редактирование
   sudo nano src/components/Login.jsx
   sudo /opt/jaguar-app/scripts/hotfix.sh restart
   ```

3. **Commit изменений**
   ```bash
   git add .
   git commit -m "hotfix: критическое исправление"
   git push origin main
   ```

4. **Синхронизация с локальной версией**
   ```bash
   # В локальной разработке
   git pull origin main
   ```

### ⚙️ Конфигурационные исправления

**Изменение .env файлов, nginx конфигурации:**

1. **Исправление на сервере**
   ```bash
   sudo nano /opt/jaguar-app/.env
   sudo nano /opt/jaguar-app/backend/.env
   sudo nano /opt/jaguar-app/nginx/nginx.conf
   ```

2. **Перезапуск**
   ```bash
   sudo /opt/jaguar-app/scripts/hotfix.sh restart
   ```

3. **Обновление в репозитории**
   ```bash
   git add .env* nginx/
   git commit -m "config: обновление конфигурации production"
   git push origin main
   ```

### 🔄 Откат к предыдущей версии

**Если новые изменения сломали приложение:**

1. **Просмотр истории**
   ```bash
   cd /opt/jaguar-app
   git log --oneline -5
   ```

2. **Откат**
   ```bash
   # Откат на 1 коммит назад
   sudo /opt/jaguar-app/scripts/hotfix.sh rollback 1
   
   # Откат на 3 коммита назад
   sudo /opt/jaguar-app/scripts/hotfix.sh rollback 3
   ```

3. **Исправление и новый деплой**
   ```bash
   # Исправьте проблему локально
   git commit -m "fix: исправление проблемы"
   git push origin main
   ```

---

## 🔍 Диагностика проблем

### 📊 Проверка статуса приложения
```bash
# Быстрая проверка (30 сек)
sudo /opt/jaguar-app/scripts/monitor.sh -q

# Полная диагностика (2-3 мин)
sudo /opt/jaguar-app/scripts/monitor.sh your-domain.com

# Проверка health endpoint
curl http://localhost:3001/api/test
curl https://your-domain.com/api/test
```

### 📋 Проверка сервисов
```bash
# Docker контейнеры
docker-compose ps
docker-compose logs -f app

# Системные сервисы
sudo systemctl status jaguar-app
sudo systemctl status nginx
sudo systemctl status docker

# Порты и соединения
sudo netstat -tlnp | grep -E ':80|:443|:3001'
```

### 🔒 Проверка безопасности
```bash
# Полный аудит безопасности
sudo /opt/jaguar-app/scripts/security-audit.sh

# Проверка firewall
sudo ufw status

# Проверка fail2ban
sudo fail2ban-client status
```

### 📁 Проверка файлов и разрешений
```bash
# Размер и права доступа
ls -la /opt/jaguar-app/
sudo du -sh /opt/jaguar-app/

# База данных
ls -la /opt/jaguar-app/backend/database/
```

---

## 🚨 Типичные проблемы и решения

### 1. 🔴 Приложение не отвечает

**Симптомы:** Сайт недоступен, 502 ошибка

**Диагностика:**
```bash
sudo /opt/jaguar-app/scripts/monitor.sh -q
docker-compose ps
curl http://localhost:3001/api/test
```

**Решения:**
```bash
# Перезапуск приложения
sudo /opt/jaguar-app/scripts/hotfix.sh restart

# Если не помогает - полная пересборка
cd /opt/jaguar-app
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Проверка логов
docker-compose logs -f app
```

### 2. 🟡 База данных повреждена

**Симптомы:** Ошибки при авторизации, потеря данных

**Диагностика:**
```bash
ls -la /opt/jaguar-app/backend/database/
docker-compose exec app sqlite3 database/jaguar_club.db ".tables"
```

**Решения:**
```bash
# Восстановление из backup
sudo /opt/jaguar-app/scripts/backup.sh list
sudo /opt/jaguar-app/scripts/backup.sh restore YYYYMMDD_HHMMSS

# Если нет backup - пересоздание БД
cd /opt/jaguar-app
docker-compose down
rm -f backend/database/jaguar_club.db
docker-compose up -d
```

### 3. 🔒 SSL сертификат истек

**Симптомы:** Предупреждения о безопасности, HTTPS не работает

**Диагностика:**
```bash
sudo certbot certificates
openssl x509 -enddate -noout -in /etc/letsencrypt/live/your-domain.com/fullchain.pem
```

**Решения:**
```bash
# Обновление сертификата
sudo certbot renew --force-renewal
sudo systemctl reload nginx

# Если не помогает - перевыпуск
sudo certbot delete --cert-name your-domain.com
sudo certbot --nginx -d your-domain.com
```

### 4. 🌐 Nginx не работает

**Симптомы:** 502/503 ошибки, сайт недоступен

**Диагностика:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Решения:**
```bash
# Перезапуск nginx
sudo systemctl restart nginx

# Если конфигурация неверная
sudo cp /opt/jaguar-app/nginx/nginx.conf /etc/nginx/sites-available/jaguar-fight-club
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 🔥 Firewall блокирует соединения

**Симптомы:** Соединения отклоняются, нет доступа к портам

**Диагностика:**
```bash
sudo ufw status verbose
sudo iptables -L
sudo fail2ban-client status
```

**Решения:**
```bash
# Проверка и настройка UFW
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow ssh
sudo ufw reload

# Проверка fail2ban бана
sudo fail2ban-client status nginx-jaguar
sudo fail2ban-client unban YOUR_IP
```

### 6. 💾 Нехватка места на диске

**Симптомы:** Ошибки записи, приложение падает

**Диагностика:**
```bash
df -h
sudo du -sh /opt/jaguar-app/
docker system df
```

**Решения:**
```bash
# Очистка Docker
docker system prune -af
docker volume prune -f

# Очистка логов
sudo truncate -s 0 /var/log/nginx/*.log
docker-compose logs --no-color > /dev/null

# Удаление старых backup'ов
sudo /opt/jaguar-app/scripts/backup.sh cleanup
```

### 7. 🔑 Проблемы с аутентификацией

**Симптомы:** Не удается войти, JWT ошибки

**Диагностика:**
```bash
cd /opt/jaguar-app
cat backend/.env | grep JWT_SECRET
docker-compose logs app | grep -i jwt
```

**Решения:**
```bash
# Проверка JWT секрета
sudo nano /opt/jaguar-app/backend/.env
# Убедитесь что JWT_SECRET установлен и не содержит "CHANGE_THIS"

# Перезапуск приложения
sudo /opt/jaguar-app/scripts/hotfix.sh restart
```

---

## 🚨 Экстренные процедуры

### 🛑 Полная остановка системы
```bash
# При критических проблемах
sudo /opt/jaguar-app/scripts/hotfix.sh stop

# Или вручную
sudo systemctl stop jaguar-app
sudo systemctl stop nginx
docker-compose down
```

### 🔄 Полное восстановление системы
```bash
# 1. Остановка всех сервисов
sudo /opt/jaguar-app/scripts/hotfix.sh stop

# 2. Восстановление из backup
sudo /opt/jaguar-app/scripts/backup.sh restore LAST_GOOD_BACKUP

# 3. Запуск системы
sudo /opt/jaguar-app/scripts/deploy.sh your-domain.com
```

### 🆘 Откат к стабильной версии
```bash
# Найти последний рабочий коммит
cd /opt/jaguar-app
git log --oneline --grep="Stable\|Release\|Production"

# Откат к конкретному коммиту
git reset --hard COMMIT_HASH
sudo /opt/jaguar-app/scripts/hotfix.sh restart
```

### 📞 Экстренные контакты и действия
```bash
# Мониторинг системы каждые 5 минут
watch -n 300 'sudo /opt/jaguar-app/scripts/monitor.sh -q'

# Создание экстренного backup
sudo /opt/jaguar-app/scripts/backup.sh
sudo cp -r /opt/jaguar-app /opt/jaguar-app-emergency-backup

# Уведомление о проблемах (если настроена почта)
echo "JAGUAR FIGHT CLUB: Критическая ошибка на $(date)" | mail -s "URGENT: Server Issue" admin@your-domain.com
```

---

## 📊 Мониторинг и логи

### 📋 Регулярный мониторинг
```bash
# Ежедневные проверки
sudo /opt/jaguar-app/scripts/monitor.sh your-domain.com > /tmp/daily_report.txt

# Еженедельный аудит безопасности
sudo /opt/jaguar-app/scripts/security-audit.sh > /tmp/security_report.txt

# Ежемесячная проверка backup'ов
sudo /opt/jaguar-app/scripts/backup.sh list
```

### 📁 Основные файлы логов
```bash
# Логи приложения
docker-compose logs -f app
tail -f /var/log/jaguar-app/*.log

# Логи nginx
sudo tail -f /var/log/nginx/jaguar_access.log
sudo tail -f /var/log/nginx/jaguar_error.log

# Системные логи
sudo journalctl -u jaguar-app -f
sudo journalctl -u nginx -f

# Логи безопасности
sudo tail -f /var/log/auth.log
sudo fail2ban-client status
```

### 📊 Мониторинг производительности
```bash
# Использование ресурсов
htop
iotop
nethogs

# Статистика Docker
docker stats
docker system df

# Размер базы данных
sudo du -sh /opt/jaguar-app/backend/database/
```

---

## 🎯 Быстрый чеклист для устранения неполадок

### ⚡ При любой проблеме:
- [ ] `sudo /opt/jaguar-app/scripts/monitor.sh -q` - быстрая диагностика
- [ ] `docker-compose logs -f app` - проверка логов
- [ ] `curl http://localhost:3001/api/test` - health check

### 🚨 Если сайт не работает:
- [ ] `sudo /opt/jaguar-app/scripts/hotfix.sh restart` - перезапуск
- [ ] `sudo systemctl status nginx` - проверка nginx
- [ ] `sudo /opt/jaguar-app/scripts/hotfix.sh rollback` - откат если нужно

### 🔒 Проблемы с безопасностью:
- [ ] `sudo /opt/jaguar-app/scripts/security-audit.sh` - аудит
- [ ] `sudo ufw status` - firewall
- [ ] `sudo fail2ban-client status` - защита от атак

### 💾 Регулярное обслуживание:
- [ ] `sudo /opt/jaguar-app/scripts/backup.sh` - еженедельные backup'ы
- [ ] `docker system prune -f` - очистка Docker
- [ ] `sudo apt update && sudo apt upgrade` - обновления системы

---

## 📞 Получение помощи

### 🔍 Сбор информации для поддержки
```bash
# Создание отчета о проблеме
{
    echo "=== JAGUAR FIGHT CLUB Problem Report ==="
    echo "Date: $(date)"
    echo "Hostname: $(hostname)"
    echo ""
    
    echo "=== Quick Status ==="
    sudo /opt/jaguar-app/scripts/monitor.sh -q
    echo ""
    
    echo "=== Recent Logs ==="
    docker-compose logs --tail=50 app
    echo ""
    
    echo "=== System Info ==="
    uname -a
    df -h
    free -h
    echo ""
    
    echo "=== Git Status ==="
    cd /opt/jaguar-app
    git log --oneline -5
    git status
    
} > /tmp/jaguar_problem_report.txt

echo "Отчет сохранен в: /tmp/jaguar_problem_report.txt"
```

### 📧 Информация для службы поддержки
При обращении за помощью, пожалуйста, предоставьте:

1. **Описание проблемы**: Что именно не работает
2. **Когда началось**: Время возникновения проблемы  
3. **Что предпринималось**: Какие команды уже выполнялись
4. **Отчет о системе**: `/tmp/jaguar_problem_report.txt`
5. **Логи ошибок**: Конкретные сообщения об ошибках

---

## 🏆 Помните: Не паникуйте!

### ✅ У вас есть все инструменты:
- 🔧 **Скрипт hotfix** для быстрого исправления
- 📊 **Мониторинг** для диагностики
- 💾 **Backup'ы** для восстановления
- 🔒 **Аудит безопасности** для проверки
- 🚀 **Автоматический деплой** через GitHub

### 🎯 В 90% случаев решение простое:
1. `sudo /opt/jaguar-app/scripts/hotfix.sh fix`
2. Выберите подходящий вариант исправления
3. Проверьте результат

**JAGUAR FIGHT CLUB всегда готов к бою! 🥊**