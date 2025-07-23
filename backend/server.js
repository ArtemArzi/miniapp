require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./src/models/database');
const authRoutes = require('./src/routes/auth');
const pointARoutes = require('./src/routes/pointA');
const commentsRoutes = require('./src/routes/comments');
const usersRoutes = require('./src/routes/users');
const trainingsRoutes = require('./src/routes/trainings');
const progressRoutes = require('./src/routes/progress');
const webhookRoutes = require('./src/routes/webhook');
const { JaguarTelegramBot } = require('./src/telegram/bot');

const app = express();
const PORT = process.env.PORT || 3001;

// Настройка rate limiting
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10000,
  message: 'Слишком много запросов с этого IP, попробуйте позже.'
});

// --- Настройка Middleware (промежуточного ПО) ---
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- Регистрация маршрутов API ---
app.use('/api/auth', authRoutes);
app.use('/api/point-a', pointARoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/trainings', trainingsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/webhook', webhookRoutes);

// Диагностический endpoint для проверки роутов
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API роуты работают!',
    availableEndpoints: {
      'POST /api/auth/login': 'Вход в систему',
      'POST /api/auth/register': 'Регистрация',
    },
    note: 'Все endpoints кроме auth требуют JWT токен!'
  });
});

// =========================================================
// === Раздача статического фронтенда (React/Vue) ===
// =========================================================
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res, next) => {
  // Исключаем API роуты из перехвата
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
  });
});

// Запуск сервера с инициализацией БД
async function startServer() {
  try {
    console.log('🚀 Запуск JAGUAR FIGHT CLUB API...');
    
    // Сразу инициализируем базу данных
    await database.init();
    
    // Инициализируем Telegram Bot
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.DISABLE_TELEGRAM_BOT !== 'true') {
      try {
        console.log('🤖 Инициализация Telegram Bot...');
        const botOptions = { polling: process.env.NODE_ENV !== 'production' ? true : false };
        const telegramBot = new JaguarTelegramBot(process.env.TELEGRAM_BOT_TOKEN, botOptions);
        app.locals.telegramBot = telegramBot;
        
        const botInfo = await telegramBot.getBotInfo();
        console.log(`✅ Telegram Bot инициализирован: @${botInfo.username}`);

        if (process.env.NODE_ENV === 'production' && process.env.TELEGRAM_WEBHOOK_URL) {
          await telegramBot.setupWebhook(process.env.TELEGRAM_WEBHOOK_URL);
          console.log(`🔗 Webhook настроен: ${process.env.TELEGRAM_WEBHOOK_URL}`);
        }
      } catch (botError) {
        console.error('❌ Ошибка инициализации Telegram Bot:', botError.message);
      }
    } else {
      console.log('ℹ️ Telegram Bot отключен (токен не найден или стоит флаг DISABLE_TELEGRAM_BOT).');
    }
    
    // Запускаем сервер с привязкой к 0.0.0.0 для Docker
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 JAGUAR FIGHT CLUB API запущен на порту ${PORT}`);
      console.log(`🌐 Доступен по адресу: http://localhost:${PORT}`);
      console.log(`🎯 Окружение: ${process.env.NODE_ENV}`);
    });
    
    app.locals.httpServer = server;
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

// Обработка корректного завершения процесса
const gracefulShutdown = async (signal) => {
  console.log(`\n🚫 Получен сигнал ${signal}...`);
  if (app.locals.httpServer) {
    app.locals.httpServer.close(async () => {
      console.log('✅ HTTP сервер остановлен');
      await database.close();
      process.exit(0);
    });
  } else {
    await database.close();
    process.exit(0);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Запускаем сервер
startServer();

module.exports = app;