/**
 * Обработчик команды /start
 * Отправляет приветственное сообщение с кнопкой запуска Mini App
 */

const { getWelcomeMessage } = require('../utils/messages');

const handleStart = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
  try {
    console.log(`👋 Пользователь ${userName} (${chatId}) выполнил команду /start`);
    
    // Получаем приветственное сообщение
    const welcomeText = getWelcomeMessage(userName);
    
    // URL Mini App (пока используем localhost, потом заменим на production URL)
    const miniAppUrl = process.env.MINI_APP_URL || 'http://localhost:5173';
    
    // Опции сообщения с Web App кнопкой
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🥊 Открыть Jaguar Fight Club',
              web_app: {
                url: miniAppUrl
              }
            }
          ],
          [
            {
              text: '📚 Справка',
              callback_data: 'help'
            },
            {
              text: '🔗 Прямая ссылка',
              url: miniAppUrl
            }
          ]
        ]
      },
      parse_mode: 'Markdown'
    };
    
    // Отправляем приветственное сообщение
    await bot.sendMessage(chatId, welcomeText, options);
    
    console.log(`✅ Приветственное сообщение отправлено пользователю ${userName}`);
    
  } catch (error) {
    console.error('❌ Ошибка в обработчике /start:', error.message);
    
    // Отправляем простое сообщение в случае ошибки
    try {
      await bot.sendMessage(chatId, 
        '❌ Произошла ошибка при загрузке приложения.\n' +
        'Попробуйте позже или используйте команду /help для получения справки.'
      );
    } catch (fallbackError) {
      console.error('❌ Критическая ошибка отправки сообщения:', fallbackError.message);
    }
  }
};

module.exports = { handleStart };