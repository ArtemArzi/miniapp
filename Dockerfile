# --- Этап 1: Сборка фронтенда ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
# Устанавливаем ВСЕ зависимости, включая vite
RUN npm install
COPY . .
# Собираем фронтенд
RUN npm run build

# --- Этап 2: Финальный образ ---
FROM node:18-alpine
WORKDIR /app

# Копируем собранный фронтенд из первого этапа
COPY --from=build /app/dist ./dist

# Копируем package.json бэкенда и устанавливаем его зависимости
COPY backend/package*.json ./backend/
RUN cd backend && npm install --only=production

# Копируем остальной код бэкенда
COPY backend/. ./backend/

# =========================================================
# === НОВЫЙ БЛОК: Исправление прав доступа к базе данных ===
# =========================================================
# Создаем папку для базы данных и делаем ее владельцем пользователя 'node'
RUN mkdir -p /app/backend/database && chown -R node:node /app/backend

# Открываем порт и запускаем приложение
EXPOSE 3001
CMD [ "node", "backend/server.js" ]

