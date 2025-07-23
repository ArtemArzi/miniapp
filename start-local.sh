#!/bin/bash

echo "🚀 Запуск JAGUAR FIGHT CLUB в режиме локальной разработки..."

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 18+"
    exit 1
fi

# Проверка наличия pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm не установлен. Установите: npm install -g pnpm"
    exit 1
fi

# Копирование .env файлов
echo "📋 Настройка .env файлов..."
cp .env.local .env 2>/dev/null || echo "Frontend .env уже настроен"
cp backend/.env.local backend/.env 2>/dev/null || echo "Backend .env уже настроен"

# Проверка и создание папки для базы данных
echo "🗄️ Подготовка базы данных..."
mkdir -p backend/database

# Установка зависимостей фронтенда
echo "📦 Установка зависимостей фронтенда..."
pnpm install

# Установка зависимостей бэкенда
echo "📦 Установка зависимостей бэкенда..."
cd backend
npm install
cd ..

echo "✅ Настройка завершена!"
echo ""
echo "🎯 Для запуска приложения:"
echo "   Terminal 1: cd backend && npm run dev      # Запуск бэкенда"
echo "   Terminal 2: pnpm dev                       # Запуск фронтенда"
echo ""
echo "📱 Приложение будет доступно:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   API Test: http://localhost:3001/api/test"