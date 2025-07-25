/**
 * Главный класс Telegram Bot для Jaguar Fight Club
 * Управляет всеми командами и взаимодействием с пользователями
 */

const TelegramBot = require('node-telegram-bot-api');
const { handleStart } = require('./handlers/start');
const { handleHelp } = require('./handlers/help');
const { handleApp } = require('./handlers/app');

class JaguarTelegramBot {
  constructor(token, options = {}) {
    this.token = token;
    this.options = {
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10
        }
      },
      ...options
    };
    
    // Создаем бота
    this.bot = new TelegramBot(this.token, this.options);
    
    // Добавляем обработку ошибок polling
    this.bot.on('polling_error', (error) => {
      console.warn('⚠️ Telegram Bot polling error (non-fatal):', error.code || error.message);
      // Не бросаем ошибку, чтобы не крашнуть основное приложение
    });
    
    this.bot.on('error', (error) => {
      console.warn('⚠️ Telegram Bot error (non-fatal):', error.message);
      // Логируем, но не останавливаем работу сервера
    });
    
    // Настраиваем обработчики команд
    this.setupCommands();
    
    console.log('🤖 Jaguar Telegram Bot инициализирован');
  }

  /**
   * Настройка обработчиков команд
   */
  setupCommands() {
    // Команда /start - приветствие и запуск Mini App
    this.bot.onText(/\/start/, (msg) => handleStart(this.bot, msg));
    
    // Команда /help - справка по использованию
    this.bot.onText(/\/help/, (msg) => handleHelp(this.bot, msg));
    
    // Команда /app - прямая ссылка на приложение
    this.bot.onText(/\/app/, (msg) => handleApp(this.bot, msg));
    
    // Обработка неизвестных команд
    this.bot.on('message', (msg) => {
      // Проверяем что это не команда которую мы уже обработали
      if (!msg.text || !msg.text.startsWith('/')) {
        return;
      }
      
      // Если команда неизвестна
      const knownCommands = ['/start', '/help', '/app'];
      const command = msg.text.split(' ')[0];
      
      if (!knownCommands.includes(command)) {
        this.bot.sendMessage(msg.chat.id, 
          `❓ Неизвестная команда: ${command}\n\n` +
          `Доступные команды:\n` +
          `/start - Запустить приложение\n` +
          `/help - Получить справку\n` +
          `/app - Открыть приложение`
        );
      }
    });
    
    console.log('✅ Команды бота настроены');
  }

  /**
   * Настройка webhook для production
   */
  async setupWebhook(webhookUrl) {
    try {
      const result = await this.bot.setWebHook(webhookUrl);
      
      // Настраиваем Menu Button для Web App
      const miniAppUrl = process.env.MINI_APP_URL || 'https://beauty-bot-ai-bot-n8n.ru';
      await this.bot.setChatMenuButton({
        menu_button: {
          type: 'web_app',
          text: '🥊 Открыть приложение',
          web_app: {
            url: miniAppUrl
          }
        }
      });
      
      console.log('✅ Webhook настроен:', webhookUrl);
      console.log('✅ Menu Button настроен:', miniAppUrl);
      return result;
    } catch (error) {
      console.error('❌ Ошибка настройки webhook:', error.message);
      throw error;
    }
  }

  /**
   * Удаление webhook (для переключения на polling)
   */
  async removeWebhook() {
    try {
      const result = await this.bot.deleteWebHook();
      console.log('✅ Webhook удален');
      return result;
    } catch (error) {
      console.error('❌ Ошибка удаления webhook:', error.message);
      throw error;
    }
  }

  /**
   * Обработка update от webhook
   */
  processUpdate(update) {
    this.bot.processUpdate(update);
  }

  /**
   * Получение информации о боте
   */
  async getBotInfo() {
    try {
      return await this.bot.getMe();
    } catch (error) {
      console.error('❌ Ошибка получения информации о боте:', error.message);
      throw error;
    }
  }

  /**
   * Остановка бота
   */
  stop() {
    if (this.options.polling) {
      this.bot.stopPolling();
    }
    console.log('🛑 Telegram Bot остановлен');
  }
}

module.exports = { JaguarTelegramBot };