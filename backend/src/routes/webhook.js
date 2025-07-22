/**
 * Webhook маршрут для Telegram Bot
 * Обрабатывает входящие обновления от Telegram
 */

const express = require('express');
const router = express.Router();

/**
 * POST /webhook/telegram
 * Обработка webhook от Telegram
 */
router.post('/telegram', (req, res) => {
  try {
    // Получаем update от Telegram
    const update = req.body;
    
    console.log('📨 Получен Telegram webhook update:', {
      updateId: update.update_id,
      messageId: update.message?.message_id,
      chatId: update.message?.chat?.id,
      text: update.message?.text?.substring(0, 50) + (update.message?.text?.length > 50 ? '...' : ''),
      from: update.message?.from?.first_name
    });
    
    // Проверяем что бот инициализирован
    if (!req.app.locals.telegramBot) {
      console.error('❌ Telegram Bot не инициализирован');
      return res.status(500).json({ error: 'Bot not initialized' });
    }
    
    // Передаем update боту для обработки
    req.app.locals.telegramBot.processUpdate(update);
    
    // Отправляем OK ответ Telegram
    res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('❌ Ошибка обработки Telegram webhook:', error.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /webhook/telegram/info
 * Информация о webhook (для отладки)
 */
router.get('/telegram/info', async (req, res) => {
  try {
    if (!req.app.locals.telegramBot) {
      return res.status(500).json({ error: 'Bot not initialized' });
    }
    
    // Получаем информацию о боте
    const botInfo = await req.app.locals.telegramBot.getBotInfo();
    
    res.json({
      bot: {
        id: botInfo.id,
        first_name: botInfo.first_name,
        username: botInfo.username,
        can_join_groups: botInfo.can_join_groups,
        can_read_all_group_messages: botInfo.can_read_all_group_messages,
        supports_inline_queries: botInfo.supports_inline_queries
      },
      webhook: {
        url: process.env.TELEGRAM_WEBHOOK_URL || 'Not configured',
        status: 'Active'
      },
      environment: {
        mini_app_url: process.env.MINI_APP_URL || 'http://localhost:5173',
        node_env: process.env.NODE_ENV || 'development'
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения информации о боте:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /webhook/telegram/setup
 * Настройка webhook (для production)
 */
router.post('/telegram/setup', async (req, res) => {
  try {
    if (!req.app.locals.telegramBot) {
      return res.status(500).json({ error: 'Bot not initialized' });
    }
    
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(400).json({ error: 'TELEGRAM_WEBHOOK_URL not configured' });
    }
    
    // Настраиваем webhook
    await req.app.locals.telegramBot.setupWebhook(webhookUrl);
    
    res.json({
      success: true,
      webhook_url: webhookUrl,
      message: 'Webhook configured successfully'
    });
    
  } catch (error) {
    console.error('❌ Ошибка настройки webhook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /webhook/telegram/remove
 * Удаление webhook (для переключения на polling)
 */
router.delete('/telegram/remove', async (req, res) => {
  try {
    if (!req.app.locals.telegramBot) {
      return res.status(500).json({ error: 'Bot not initialized' });
    }
    
    // Удаляем webhook
    await req.app.locals.telegramBot.removeWebhook();
    
    res.json({
      success: true,
      message: 'Webhook removed successfully'
    });
    
  } catch (error) {
    console.error('❌ Ошибка удаления webhook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;