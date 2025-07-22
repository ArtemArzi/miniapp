/**
 * Обработчик команды /help
 * Отправляет справочную информацию о боте и доступных командах
 */

const handleHelp = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
  try {
    console.log(`❓ Пользователь ${userName} (${chatId}) запросил справку`);
    
    const helpText = `
🥊 *Jaguar Fight Club - Справка*

Добро пожаловать в бота Jaguar Fight Club!

📱 *Основные возможности:*
• Быстрый доступ к приложению клуба
• Отслеживание прогресса тренировок
• Получение обратной связи от тренеров
• Сетевое взаимодействие с участниками клуба

🎯 *Доступные команды:*
/start - Запустить приложение
/app - Открыть приложение напрямую
/help - Показать эту справку

💡 *Как пользоваться:*
1. Нажмите на кнопку "🥊 Открыть Jaguar Fight Club"
2. Войдите в свой аккаунт или зарегистрируйтесь
3. Начните отслеживать свой прогресс!

📞 *Поддержка:*
Если у вас возникли вопросы, обратитесь к администрации клуба.

Удачных тренировок! 💪
    `;
    
    // Опции сообщения с inline клавиатурой
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🥊 Открыть приложение',
              url: process.env.MINI_APP_URL || 'http://localhost:5173'
            }
          ],
          [
            {
              text: '🔄 Главное меню',
              callback_data: 'main_menu'
            }
          ]
        ]
      },
      parse_mode: 'Markdown'
    };
    
    // Отправляем справочное сообщение
    await bot.sendMessage(chatId, helpText, options);
    
    console.log(`✅ Справка отправлена пользователю ${userName}`);
    
  } catch (error) {
    console.error('❌ Ошибка в обработчике /help:', error.message);
    
    // Отправляем простое сообщение в случае ошибки
    try {
      await bot.sendMessage(chatId, 
        '❌ Произошла ошибка при загрузке справки.\n' +
        'Используйте команду /start для запуска приложения.'
      );
    } catch (fallbackError) {
      console.error('❌ Критическая ошибка отправки справки:', fallbackError.message);
    }
  }
};

module.exports = { handleHelp };