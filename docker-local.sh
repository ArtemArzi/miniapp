#!/bin/bash

echo "🐳 Локальное тестирование JAGUAR FIGHT CLUB в Docker..."

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down -v

# Очистка Docker cache
echo "🧹 Очистка Docker кэша..."
docker system prune -f
docker builder prune -f

# Проверка .env файлов
echo "📋 Проверка .env файлов..."
if [ ! -f .env.production ]; then
    echo "❌ Отсутствует .env.production"
    exit 1
fi

if [ ! -f backend/.env.production ]; then
    echo "❌ Отсутствует backend/.env.production"
    exit 1
fi

# Пересборка и запуск
echo "🔨 Пересборка Docker образа..."
docker-compose build --no-cache

echo "🚀 Запуск контейнера..."
docker-compose up -d

echo "📊 Статус контейнеров:"
docker-compose ps

echo "📋 Логи приложения:"
docker-compose logs -f app