/**
 * Обработчик команды /app
 * Отправляет прямую ссылку на Mini App
 */

const handleApp = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
  try {
    console.log(`🔗 Пользователь ${userName} (${chatId}) запросил прямую ссылку`);
    
    // URL Mini App
    const miniAppUrl = process.env.MINI_APP_URL || 'http://localhost:5173';
    
    const appText = `
🥊 *Jaguar Fight Club*

Прямая ссылка на приложение:
${miniAppUrl}

Нажмите кнопку ниже для быстрого доступа к приложению 👇
    `;
    
    // Опции сообщения с inline клавиатурой
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🥊 Открыть Jaguar Fight Club',
              web_app: { url: miniAppUrl }
            }
          ],
          [
            {
              text: '📚 Справка',
              callback_data: 'help'
            },
            {
              text: '🔄 Главное меню',
              callback_data: 'main_menu'
            }
          ]
        ]
      },
      parse_mode: 'Markdown'
    };
    
    // Отправляем сообщение с ссылкой
    await bot.sendMessage(chatId, appText, options);
    
    console.log(`✅ Прямая ссылка отправлена пользователю ${userName}`);
    
  } catch (error) {
    console.error('❌ Ошибка в обработчике /app:', error.message);
    
    // Отправляем простое сообщение в случае ошибки
    try {
      await bot.sendMessage(chatId, 
        '❌ Произошла ошибка при получении ссылки.\n' +
        `Попробуйте перейти по ссылке напрямую: ${process.env.MINI_APP_URL || 'http://localhost:5173'}`
      );
    } catch (fallbackError) {
      console.error('❌ Критическая ошибка отправки ссылки:', fallbackError.message);
    }
  }
};

module.exports = { handleApp };