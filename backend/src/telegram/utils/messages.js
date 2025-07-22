/**
 * Шаблоны сообщений для Telegram Bot
 * Централизованное хранение всех текстовых сообщений бота
 */

/**
 * Получить приветственное сообщение для команды /start
 * @param {string} userName - Имя пользователя
 * @returns {string} Приветственное сообщение
 */
const getWelcomeMessage = (userName) => {
  return `
🥊 *Добро пожаловать в Jaguar Fight Club, ${userName}!*

Это официальный бот премиум клуба Muay Thai, где ваш прогресс имеет значение.

✨ *Что вас ждет:*
• 📊 Отслеживание тренировочного прогресса
• 💬 Персональная обратная связь от тренеров
• 🏆 Достижения и цели
• 🤝 Нетворкинг с участниками клуба

🚀 *Начните свой путь к совершенству:*
Нажмите кнопку ниже, чтобы открыть приложение и начать отслеживать свой прогресс!

💪 *Jaguar Fight Club - Где рождаются чемпионы!*
  `;
};

/**
 * Получить сообщение об ошибке
 * @param {string} errorType - Тип ошибки
 * @returns {string} Сообщение об ошибке
 */
const getErrorMessage = (errorType = 'general') => {
  const errorMessages = {
    general: '❌ Произошла ошибка. Попробуйте позже или обратитесь к администрации клуба.',
    network: '🌐 Проблемы с подключением. Проверьте интернет и попробуйте снова.',
    auth: '🔐 Ошибка авторизации. Попробуйте войти в приложение заново.',
    maintenance: '🔧 Приложение временно недоступно из-за технических работ. Попробуйте позже.'
  };
  
  return errorMessages[errorType] || errorMessages.general;
};

/**
 * Получить сообщение о техническом обслуживании
 * @returns {string} Сообщение о тех. обслуживании
 */
const getMaintenanceMessage = () => {
  return `
🔧 *Техническое обслуживание*

Приложение Jaguar Fight Club временно недоступно.

⏰ *Продолжительность:* 30-60 минут
🔄 *Статус:* Обновление системы

Мы работаем над улучшением вашего опыта!
Попробуйте позже.

Спасибо за понимание! 🙏
  `;
};

/**
 * Получить сообщение о новом комментарии от тренера
 * @param {string} trainerName - Имя тренера
 * @param {string} comment - Текст комментария
 * @returns {string} Уведомление о комментарии
 */
const getNewCommentNotification = (trainerName, comment) => {
  return `
💬 *Новый комментарий от тренера!*

👨‍🏫 *Тренер:* ${trainerName}

📝 *Комментарий:*
"${comment}"

Откройте приложение, чтобы ответить и увидеть детали!
  `;
};

/**
 * Получить напоминание о тренировке
 * @param {string} trainingType - Тип тренировки
 * @param {string} time - Время тренировки
 * @returns {string} Напоминание о тренировке
 */
const getTrainingReminder = (trainingType, time) => {
  return `
⏰ *Напоминание о тренировке!*

🥊 *Тип:* ${trainingType}
🕐 *Время:* ${time}

Не забудьте взять:
• Спортивную форму
• Перчатки
• Бутылку воды
• Хорошее настроение! 😊

Увидимся в зале! 💪
  `;
};

/**
 * Получить статистику прогресса
 * @param {Object} stats - Объект со статистикой
 * @returns {string} Сообщение со статистикой
 */
const getProgressStats = (stats) => {
  return `
📊 *Ваш прогресс за неделю*

🏆 *Достижения:*
• Тренировок: ${stats.trainings || 0}
• Часов в зале: ${stats.hours || 0}
• Сожжено калорий: ${stats.calories || 0}

📈 *Прогресс:*
• Техника: ${stats.technique || 'Отлично'}
• Выносливость: ${stats.endurance || 'Хорошо'}
• Сила: ${stats.strength || 'Отлично'}

Продолжайте в том же духе! 🔥
  `;
};

module.exports = {
  getWelcomeMessage,
  getErrorMessage,
  getMaintenanceMessage,
  getNewCommentNotification,
  getTrainingReminder,
  getProgressStats
};