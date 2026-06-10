# JAGUAR FIGHT CLUB

Премиальное веб-приложение для клуба тайского бокса с отслеживанием прогресса клиентов, обратной связью от тренеров и функциями нетворкинга.

## 🚀 Быстрый старт

### Разработка

1. **Клонирование и настройка:**
```bash
git clone <repository-url>
cd jaguar_project
```

2. **Настройка backend:**
```bash
cd backend
npm install
cp .env.example .env
# Отредактируйте .env файл с вашей конфигурацией
npm run dev
```

3. **Настройка frontend:**
```bash
# В корне проекта
pnpm install
pnpm dev
```

### Production развертывание

#### Быстрая настройка
```bash
# Для разработки
./scripts/quick-setup.sh dev

# Для Docker
./scripts/quick-setup.sh docker

# Для production на VPS
sudo ./scripts/quick-setup.sh prod your-domain.com
```

#### Полный VPS деплой
```bash
# Автоматический деплой на VPS
sudo ./scripts/deploy.sh your-domain.com
```

#### Использование Docker (Рекомендуется)

```bash
# Сборка и запуск через Docker Compose
npm run docker:compose

# Или вручную
npm run docker:build
npm run docker:run
```

## 📋 Возможности

- **Управление клиентами**: Отслеживание прогресса и результатов учеников
- **Система тренировок**: Запись тренировочных сессий и посещаемости
- **Отслеживание прогресса**: Визуальное отслеживание прогресса по методологии "из точки А в точку Б"
- **Обратная связь тренеров**: Система комментариев для общения тренер-клиент
- **Система грейдов**: Автоматическое продвижение через уровни тайского бокса
- **Mobile-First**: Адаптивный дизайн для всех устройств
- **Telegram Bot**: Интеграция с Mini App для мобильного доступа

## 🏗️ Архитектура

### Frontend
- **React 18** с современными хуками
- **Vite** для быстрой разработки и сборки
- **Tailwind CSS v4** для стилизации
- **Radix UI** для доступных компонентов
- **React Router v6** для навигации

### Backend
- **Node.js** с фреймворком Express
- **SQLite** база данных для сохранения данных
- **JWT** аутентификация
- **Rate limiting** и middleware безопасности
- **RESTful API** дизайн
- **Telegram Bot** интеграция

## 📁 Структура проекта

```
/
├── src/                    # React frontend
│   ├── components/         # React компоненты
│   ├── contexts/          # React контексты
│   ├── services/          # Слой API сервисов
│   └── main.jsx           # Точка входа приложения
├── backend/               # Node.js Express API
│   ├── src/
│   │   ├── routes/        # API маршруты
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Модели базы данных
│   │   └── utils/         # Вспомогательные функции
│   ├── database/          # Файлы базы данных SQLite
│   └── server.js          # Точка входа backend
├── scripts/               # Скрипты деплоя и управления
│   ├── deploy.sh          # Автоматический деплой на VPS
│   ├── monitor.sh         # Мониторинг приложения
│   ├── backup.sh          # Резервное копирование
│   └── quick-setup.sh     # Быстрая настройка
├── config/                # Конфигурационные файлы
│   ├── fail2ban/         # Настройки безопасности
│   └── systemd/          # Системные службы
├── nginx/                 # Конфигурация nginx
└── public/                # Статические ресурсы
```

## 🔧 Конфигурация

### Переменные окружения

Backend (`.env`):
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here
DB_PATH=./database/jaguar_club.db
FRONTEND_URL=http://localhost:5173
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Коды приглашения для регистрации
COACH_INVITE_CODE=JAGUAR_COACH_2024
ADMIN_INVITE_CODE=JAGUAR_ADMIN_2024
```

### 🔑 Код регистрации тренеров

**Для регистрации тренеров используйте код**: `JAGUAR_COACH_2024`

- Клиенты регистрируются свободно
- Тренеры должны ввести код приглашения при регистрации
- Код можно изменить в настройках `.env`

## 🗄️ Схема базы данных

- **users**: Аккаунты клиентов/тренеров/администраторов
- **point_a_forms**: Первоначальные оценки клиентов
- **trainings**: Тренировочные сессии с посещаемостью
- **trainer_comments**: Система обратной связи тренеров
- **progress_updates**: Отслеживание прогресса клиентов
- **user_profiles**: Публичные профили для нетворкинга

## 👥 Роли пользователей

### Разрешения ролей
- **Клиент**: Просмотр собственного прогресса, чтение комментариев тренеров
- **Тренер**: Управление закрепленными клиентами, добавление записей тренировок, оставление отзывов
- **Администратор**: Полный доступ к системе, управление пользователями

## 🎯 Система грейдов

Автоматическое продвижение основанное на посещенных тренировках:
- 🥊 **Новичок** (Beginner): 0-4 тренировки
- 💪 **Практик** (Practitioner): 5-14 тренировок
- 🎓 **Ученик** (Student): 15-29 тренировок
- 🥋 **Боец** (Fighter): 30-59 тренировок
- ⚔️ **Воин** (Warrior): 60-99 тренировок
- 🦁 **Король джунглей** (Jungle King): 100+ тренировок

## 🛠️ Команды для разработки

### Frontend
```bash
pnpm dev             # Запуск сервера разработки
pnpm build           # Сборка для продакшена
pnpm lint            # Запуск ESLint
pnpm preview         # Предварительный просмотр сборки
```

### Backend
```bash
npm run dev          # Запуск с nodemon (разработка)
npm start            # Запуск production сервера
npm run prod         # Запуск с NODE_ENV=production
```

### Docker
```bash
npm run docker:build    # Сборка Docker образа
npm run docker:run      # Запуск Docker контейнера
npm run docker:compose  # Запуск с docker-compose
npm run docker:stop     # Остановка docker-compose
```

### VPS Management
```bash
# Быстрая настройка
./scripts/quick-setup.sh [dev|docker|prod]

# VPS деплой
sudo ./scripts/deploy.sh your-domain.com

# Мониторинг
sudo ./scripts/monitor.sh [-q|--quick]

# Резервные копии
sudo ./scripts/backup.sh [backup|restore|list|cleanup]

# Аудит безопасности
sudo ./scripts/security-audit.sh
```

## 🔒 Функции безопасности

- Аутентификация на основе JWT
- Хеширование паролей с bcryptjs
- Ограничение скорости (100 запросов за 15 минут)
- Конфигурация CORS
- Заголовки безопасности Helmet.js
- Валидация входных данных на всех эндпоинтах
- Fail2ban защита от брутфорс атак
- UFW firewall конфигурация
- SSL/TLS сертификаты Let's Encrypt
- Автоматические аудиты безопасности

## 📱 API Эндпоинты

### Аутентификация
- `POST /api/auth/login` - Вход пользователя
- `POST /api/auth/register` - Регистрация пользователя
- `GET /api/auth/profile` - Получение профиля пользователя

### Управление тренировками
- `POST /api/trainings` - Добавление тренировочной сессии
- `GET /api/trainings` - Получение тренировочных сессий
- `GET /api/trainings/stats/:clientId` - Получение статистики клиента

### Система комментариев
- `POST /api/comments` - Добавление комментария тренера
- `GET /api/comments/:userId` - Получение комментариев клиента
- `GET /api/comments/unread/count` - Получение количества непрочитанных

### Отслеживание прогресса
- `POST /api/point-a` - Отправка первоначальной оценки
- `GET /api/point-a/:userId` - Получение данных оценки
- `POST /api/progress` - Обновление данных прогресса

### Управление пользователями
- `GET /api/users` - Получение списка пользователей (админ)
- `GET /api/users/stats` - Статистика пользователей

## 🚀 Production развертывание

### Системные требования
- Ubuntu 20.04+ / Debian 11+ или Docker
- 2GB RAM минимум (рекомендуется 4GB)
- 20GB+ дискового пространства
- Node.js 18+ (если без Docker)
- Публичный IP адрес

### Автоматическое развертывание
```bash
# Полный автоматический деплой на VPS
sudo ./scripts/deploy.sh your-domain.com

# Включает:
# - Установку всех зависимостей
# - Настройку Docker и nginx
# - SSL сертификаты Let's Encrypt
# - Firewall и fail2ban
# - Мониторинг и backup'ы
```

### Настройка окружения
1. Установить `NODE_ENV=production`
2. Использовать надежный `JWT_SECRET`
3. Настроить правильные CORS origins
4. Настроить SSL/TLS (автоматически с Let's Encrypt)
5. Настроить Telegram Bot токен

### CI/CD Pipeline
- **GitHub Actions**: Автоматический деплой при push
- **Health Checks**: Автоматические проверки работоспособности
- **Rollback**: Автоматический откат при ошибках
- **Notifications**: Уведомления о статусе деплоя

### Мониторинг работоспособности
- Health check эндпоинт: `GET /api/test`
- Автоматический мониторинг каждые 15 минут
- Логи в `/var/log/jaguar-app/`
- Автоматические backup'ы ежедневно

### Безопасность
- **Fail2ban**: Защита от брутфорс атак
- **UFW Firewall**: Только необходимые порты открыты
- **SSL/TLS**: Автоматические сертификаты
- **Security Headers**: Полная настройка nginx
- **Аудит безопасности**: Еженедельные автоматические проверки

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature ветку: `git checkout -b feature/new-feature`
3. Commit изменения: `git commit -am 'Add new feature'`
4. Push в ветку: `git push origin feature/new-feature`
5. Создайте pull request

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей

## 📞 Поддержка

По вопросам поддержки обращайтесь к команде разработки или создайте issue в репозитории.

### 📚 Полезная документация
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Подробное руководство по развертыванию
- **[CLAUDE.md](CLAUDE.md)**: Инструкции для разработчиков

---

**JAGUAR FIGHT CLUB** - Расширение возможностей бойцов через технологии 🥊