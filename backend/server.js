require('dotenv').config();
const express = require('express');
const path = require('path'); // Добавлена эта строка для работы с путями
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

// Функция проверки и освобождения порта
async function ensurePortAvailable(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, '0.0.0.0', (err) => {
      if (err) {
        console.log(`⚠️  Порт ${port} занят, попытка освобождения...`);
        server.close();
        
        // Принудительно освобождаем порт (для Docker)
        const { exec } = require('child_process');
        exec(`kill -9 $(lsof -ti:${port}) 2>/dev/null || echo "Процессы на порту ${port} не найдены"`, (error, stdout, stderr) => {
          console.log(`🔄 Освобождение порта ${port}: ${stdout}`);
          setTimeout(resolve, 3000); // Даем время на освобождение
        });
      } else {
        console.log(`✅ Порт ${port} доступен`);
        server.close();
        resolve();
      }
    });
    
    server.on('error', (err) => {
      console.log(`⚠️  Ошибка проверки порта ${port}: ${err.message}`);
      server.close();
      
      // Принудительно освобождаем порт
      const { exec } = require('child_process');
      exec(`kill -9 $(lsof -ti:${port}) 2>/dev/null || echo "Процессы на порту ${port} не найдены"`, (error, stdout, stderr) => {
        console.log(`🔄 Принудительное освобождение порта ${port}: ${stdout}`);
        setTimeout(resolve, 3000);
      });
    });
  });
}

// Настройка rate limiting
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10000,
  message: 'Слишком много запросов с этого IP, попробуйте позже.'
});

// --- Настройка Middleware (промежуточного ПО) ---
// app.use(helmet());
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

// --- Обслуживание статических файлов ---
// Serve static files from React build directory
app.use(express.static(path.join(__dirname, '../dist')));

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
      // ... и другие ваши эндпоинты
    },
    note: 'Все endpoints кроме auth требуют JWT токен!'
  });
});


// =========================================================
// === НОВЫЙ БЛОК: Раздача статического фронтенда (React) ===
// =========================================================
// Этот блок должен идти ПОСЛЕ всех маршрутов API

// 1. Указываем Express, где лежат статические файлы (сборка React)
// Путь '../dist' правильный, так как server.js находится в /app/backend, а сборка в /app/dist
app.use(express.static(path.join(__dirname, '../dist')));

// 2. На все остальные запросы (которые не /api/*) отдаем главный файл фронтенда
// Это нужно, чтобы роутинг на стороне клиента (React Router) работал корректно
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});


// --- Запуск сервера ---
// Старый вызов app.listen() удален - теперь используется только startServer()

// Базовый роут для проверки
app.get('/', (req, res) => {
  res.json({ 
    message: 'JAGUAR FIGHT CLUB API работает! 🦁',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth (login, register, profile)',
      pointA: '/api/point-a (сохранение/получение анкет)',
      comments: '/api/comments (комментарии тренеров)',
      users: '/api/users (список клиентов, статистика)',
      test: '/api/test (полный список endpoints)',
      docs: '/test/API_TESTING_FULL.md (документация)'
    }
  });
});

// Здоровье API
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint не найден',
    path: req.originalUrl 
  });
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
    
    // Проверяем и освобождаем порт
    await ensurePortAvailable(PORT);
    
    // Инициализируем базу данных
    await database.init();
    
    // Инициализируем Telegram Bot (если токен задан и не отключен)
    let telegramBot = null;
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.DISABLE_TELEGRAM_BOT !== 'true') {
      try {
        console.log('🤖 Инициализация Telegram Bot...');
        
        // Создаем бота с улучшенными настройками polling для разработки
        const botOptions = {
          polling: process.env.NODE_ENV !== 'production' ? {
            interval: 2000, // Увеличиваем интервал для стабильности
            autoStart: true, // Включаем автозапуск для разработки
            params: {
              timeout: 10 // Уменьшаем timeout
            }
          } : false
        };
        
        telegramBot = new JaguarTelegramBot(process.env.TELEGRAM_BOT_TOKEN, botOptions);
        
        // Сохраняем ссылку на бота в app.locals для webhook
        app.locals.telegramBot = telegramBot;
        
        // Получаем информацию о боте
        const botInfo = await telegramBot.getBotInfo();
        console.log(`✅ Telegram Bot инициализирован: @${botInfo.username} (${botInfo.first_name})`);
        
        // В production настраиваем webhook
        if (process.env.NODE_ENV === 'production' && process.env.TELEGRAM_WEBHOOK_URL) {
          await telegramBot.setupWebhook(process.env.TELEGRAM_WEBHOOK_URL);
          console.log(`🔗 Webhook настроен: ${process.env.TELEGRAM_WEBHOOK_URL}`);
        }
        
      } catch (botError) {
        console.error('❌ Ошибка инициализации Telegram Bot:', botError.message);
        console.log('🔄 Сервер будет запущен без Telegram Bot');
        console.log('ℹ️  Для отключения Telegram Bot удалите TELEGRAM_BOT_TOKEN из .env');
      }
    } else {
      if (process.env.DISABLE_TELEGRAM_BOT === 'true') {
        console.log('ℹ️  Telegram Bot отключен (DISABLE_TELEGRAM_BOT=true)');
      } else {
        console.log('ℹ️  TELEGRAM_BOT_TOKEN не задан - Telegram Bot отключен');
      }
    }
    
    // Запускаем сервер с привязкой к 0.0.0.0 для Docker
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 JAGUAR FIGHT CLUB API запущен на порту ${PORT}`);
      console.log(`🌐 Доступен по адресу: http://0.0.0.0:${PORT}`);
      console.log(`🎯 Окружение: ${process.env.NODE_ENV}`);
      console.log(`📊 API Endpoints:`);
      console.log(`   ✨ Аутентификация:`);
      console.log(`   - POST /api/auth/login - Вход`);
      console.log(`   - POST /api/auth/register - Регистрация`);
      console.log(`   - GET /api/auth/profile - Профиль`);
      console.log(`   📋 Анкеты "Точка А":`);
      console.log(`   - POST /api/point-a - Сохранение анкеты`);
      console.log(`   - GET /api/point-a - Получение анкеты`);
      console.log(`   💬 Комментарии:`);
      console.log(`   - POST /api/comments - Добавление (тренер)`);
      console.log(`   - GET /api/comments - Получение комментариев`);
      console.log(`   👥 Пользователи:`);
      console.log(`   - GET /api/users - Список клиентов (тренер)`);
      console.log(`   - GET /api/users/:id - Информация о пользователе`);
      console.log(``);
      console.log(`🧪 Тестирование: http://localhost:${PORT}/test/API_TESTING_FULL.md`);
    });
    
    // Сохраняем ссылку на сервер для graceful shutdown
    app.locals.httpServer = server;
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

// Обработка завершения процесса
const gracefulShutdown = async (signal) => {
  console.log(`\n🚫 Получен сигнал ${signal}...`);
  
  // Останавливаем HTTP сервер
  if (app.locals.httpServer) {
    console.log('🌐 Остановка HTTP сервера...');
    app.locals.httpServer.close(() => {
      console.log('✅ HTTP сервер остановлен');
    });
  }
  
  // Останавливаем Telegram Bot
  if (app.locals.telegramBot) {
    console.log('🤖 Остановка Telegram Bot...');
    app.locals.telegramBot.stop();
  }
  
  // Закрываем базу данных
  await database.close();
  console.log('👋 Сервер остановлен');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Запускаем сервер
startServer();

module.exports = app;
