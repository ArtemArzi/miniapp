# JAGUAR FIGHT CLUB - Backend API

Backend API для премиального клуба Muay Thai "JAGUAR FIGHT CLUB".

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск в production
npm start
```

## 🏗️ Структура проекта

```
backend/
├── src/
│   ├── routes/          # API маршруты
│   ├── middleware/      # Middleware функции
│   └── models/          # Модели данных
├── database/           # SQLite база данных
├── server.js           # Главный файл сервера
├── package.json        # Зависимости проекта
└── .env               # Переменные окружения
```

## 🔧 API Endpoints

### Базовые
- `GET /` - Проверка работы API
- `GET /health` - Статус здоровья API

### Аутентификация (будет добавлено)
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/register` - Регистрация
- `GET /api/auth/profile` - Профиль пользователя

### Пользователи (будет добавлено)
- `GET /api/users` - Список пользователей (только тренеры)
- `PUT /api/users/profile` - Обновление профиля

### Анкеты "Точка А" (будет добавлено)
- `POST /api/point-a` - Сохранение анкеты
- `GET /api/point-a` - Получение анкеты

## 🛡️ Безопасность

- JWT аутентификация
- Rate limiting (100 запросов/15 минут)
- Helmet.js для базовой безопасности
- CORS настроен только для фронтенда
- Валидация входных данных

## 🗄️ База данных

Используется SQLite для простоты развертывания и минимальных требований к серверу.

## 🌍 Переменные окружения

Скопируйте `.env.example` в `.env` и настройте:

```
PORT=3001
JWT_SECRET=your_secret_key
DB_PATH=./database/jaguar_club.db
FRONTEND_URL=http://localhost:5173
```

## 📝 Требования

- Node.js 16+
- npm или yarn
