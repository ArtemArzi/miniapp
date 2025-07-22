const express = require('express');
const database = require('../models/database');
const { authenticateToken, requireCoachOrAdmin } = require('../middleware/auth');
const { validateTrainerComment } = require('../middleware/validation');

const router = express.Router();

// POST /api/comments - Добавление комментария от тренера
router.post('/', authenticateToken, requireCoachOrAdmin, validateTrainerComment, async (req, res) => {
  try {
    const coachId = req.user.id;
    const { userId, comment, trainingType = 'Тренировка' } = req.body;

    // Проверяем что пользователь существует и является клиентом
    const client = await database.get(
      'SELECT id, name, email FROM users WHERE id = ? AND role = "client" AND is_active = 1',
      [userId]
    );

    if (!client) {
      return res.status(404).json({ 
        error: 'Клиент не найден или неактивен' 
      });
    }

    // Создаем комментарий (без привязки к конкретной тренировке)
    const commentResult = await database.run(`
      INSERT INTO trainer_comments (user_id, coach_id, comment_text, training_type)
      VALUES (?, ?, ?, ?)
    `, [userId, coachId, comment, trainingType]);

    console.log(`💬 Тренер ${req.user.name} оставил комментарий клиенту ${client.name}`);

    res.status(201).json({
      success: true,
      message: 'Комментарий добавлен успешно',
      comment: {
        id: commentResult.id,
        userId: parseInt(userId),
        coachId: coachId,
        coachName: req.user.name,
        comment: comment,
        trainingType: trainingType,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Ошибка добавления комментария:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при добавлении комментария' 
    });
  }
});

// GET /api/comments - Получение комментариев для текущего пользователя
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 3, offset = 0, all = false } = req.query;
    
    // Если запрошены все комментарии, убираем лимит
    const actualLimit = all === 'true' ? 999 : parseInt(limit);

    let comments;
    let totalCount;

    if (req.user.role === 'client') {
      // Для клиентов - получаем их комментарии
      comments = await database.all(`
        SELECT 
          tc.id,
          tc.comment_text as comment,
          tc.is_read as isRead,
          tc.created_at as createdAt,
          COALESCE(tc.training_type, t.training_type, 'Тренировка') as trainingType,
          COALESCE(t.training_date, DATE(tc.created_at)) as trainingDate,
          u.name as coachName,
          u.email as coachEmail
        FROM trainer_comments tc
        LEFT JOIN trainings t ON tc.training_id = t.id
        JOIN users u ON tc.coach_id = u.id
        WHERE tc.user_id = ?
        ORDER BY tc.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, actualLimit, parseInt(offset)]);

      const countResult = await database.get(
        'SELECT COUNT(*) as count FROM trainer_comments WHERE user_id = ?',
        [userId]
      );
      totalCount = countResult.count;

      // Отмечаем комментарии как прочитанные
      if (comments.length > 0) {
        await database.run(
          'UPDATE trainer_comments SET is_read = 1 WHERE user_id = ? AND is_read = 0',
          [userId]
        );
      }

    } else if (req.user.role === 'coach') {
      // Для тренеров - получаем комментарии которые они оставили
      comments = await database.all(`
        SELECT 
          tc.id,
          tc.comment_text as comment,
          tc.is_read as isRead,
          tc.created_at as createdAt,
          COALESCE(tc.training_type, t.training_type, 'Тренировка') as trainingType,
          COALESCE(t.training_date, DATE(tc.created_at)) as trainingDate,
          u.name as clientName,
          u.email as clientEmail,
          u.id as clientId
        FROM trainer_comments tc
        LEFT JOIN trainings t ON tc.training_id = t.id
        JOIN users u ON tc.user_id = u.id
        WHERE tc.coach_id = ?
        ORDER BY tc.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, actualLimit, parseInt(offset)]);

      const countResult = await database.get(
        'SELECT COUNT(*) as count FROM trainer_comments WHERE coach_id = ?',
        [userId]
      );
      totalCount = countResult.count;

    } else {
      // Для админов - все комментарии
      comments = await database.all(`
        SELECT 
          tc.id,
          tc.comment_text as comment,
          tc.is_read as isRead,
          tc.created_at as createdAt,
          t.training_type as trainingType,
          t.training_date as trainingDate,
          coach.name as coachName,
          coach.email as coachEmail,
          client.name as clientName,
          client.email as clientEmail,
          client.id as clientId
        FROM trainer_comments tc
        JOIN trainings t ON tc.training_id = t.id
        JOIN users coach ON tc.coach_id = coach.id
        JOIN users client ON tc.user_id = client.id
        ORDER BY tc.created_at DESC
        LIMIT ? OFFSET ?
      `, [actualLimit, parseInt(offset)]);

      const countResult = await database.get('SELECT COUNT(*) as count FROM trainer_comments');
      totalCount = countResult.count;
    }

    res.json({
      success: true,
      message: 'Комментарии получены успешно',
      comments,
      pagination: {
        total: totalCount,
        limit: actualLimit,
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + actualLimit) < totalCount,
        isShowingAll: all === 'true'
      }
    });

  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении комментариев' 
    });
  }
});

// GET /api/comments/:userId - Получение комментариев конкретного клиента (для тренеров)
router.get('/:userId', authenticateToken, requireCoachOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 3, offset = 0, all = false } = req.query;
    
    // Если запрошены все комментарии, убираем лимит
    const actualLimit = all === 'true' ? 999 : parseInt(limit);

    // Проверяем что клиент существует
    const client = await database.get(
      'SELECT id, name, email FROM users WHERE id = ? AND role = "client"',
      [userId]
    );

    if (!client) {
      return res.status(404).json({ 
        error: 'Клиент не найден' 
      });
    }

    const comments = await database.all(`
      SELECT 
        tc.id,
        tc.comment_text as comment,
        tc.is_read as isRead,
        tc.created_at as createdAt,
        COALESCE(tc.training_type, t.training_type, 'Тренировка') as trainingType,
        COALESCE(t.training_date, DATE(tc.created_at)) as trainingDate,
        u.name as coachName,
        u.email as coachEmail
      FROM trainer_comments tc
      LEFT JOIN trainings t ON tc.training_id = t.id
      JOIN users u ON tc.coach_id = u.id
      WHERE tc.user_id = ?
      ORDER BY tc.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, actualLimit, parseInt(offset)]);

    const countResult = await database.get(
      'SELECT COUNT(*) as count FROM trainer_comments WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Комментарии клиента получены успешно',
      client: {
        id: client.id,
        name: client.name,
        email: client.email
      },
      comments,
      pagination: {
        total: countResult.count,
        limit: actualLimit,
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + actualLimit) < countResult.count,
        isShowingAll: all === 'true'
      }
    });

  } catch (error) {
    console.error('Ошибка получения комментариев клиента:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении комментариев клиента' 
    });
  }
});

// GET /api/comments/unread/count - Количество непрочитанных комментариев
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.json({ unreadCount: 0 });
    }

    const result = await database.get(
      'SELECT COUNT(*) as count FROM trainer_comments WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );

    res.json({ 
      unreadCount: result.count 
    });

  } catch (error) {
    console.error('Ошибка подсчета непрочитанных комментариев:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при подсчете непрочитанных комментариев' 
    });
  }
});

// PUT /api/comments/:id/read - Отметить конкретный комментарий как прочитанный
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Проверяем что комментарий принадлежит этому пользователю
    const comment = await database.get(
      'SELECT id FROM trainer_comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!comment) {
      return res.status(404).json({ 
        error: 'Комментарий не найден или у вас нет прав на его изменение' 
      });
    }

    // Отмечаем как прочитанный
    await database.run(
      'UPDATE trainer_comments SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    console.log(`✅ Комментарий ${id} отмечен как прочитанный пользователем ${req.user.name}`);

    res.json({
      message: 'Комментарий отмечен как прочитанный',
      commentId: parseInt(id)
    });

  } catch (error) {
    console.error('Ошибка отметки комментария как прочитанного:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при отметке комментария как прочитанного' 
    });
  }
});

module.exports = router;
