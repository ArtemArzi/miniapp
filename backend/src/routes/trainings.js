const express = require('express');
const router = express.Router();
const database = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { getGradeInfo } = require('../utils/gradeCalculator');

// POST /api/trainings - Добавить новую тренировку
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { clientId, trainingDate, trainingType, attended, comment } = req.body;
    const coachId = req.user.id;

    // Проверяем что пользователь - тренер или админ
    if (req.user.role !== 'coach' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Только тренеры могут добавлять тренировки' 
      });
    }

    // Валидация данных
    if (!clientId || !trainingDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Обязательные поля: clientId, trainingDate' 
      });
    }

    // Проверяем что клиент существует
    const client = await database.get(
      'SELECT id, name FROM users WHERE id = ? AND role = "client"',
      [clientId]
    );

    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: 'Клиент не найден' 
      });
    }

    // Добавляем тренировку
    const result = await database.run(
      `INSERT INTO trainings (user_id, coach_id, training_date, training_type, attended, comment) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clientId, coachId, trainingDate, trainingType || 'Общая', attended ? 1 : 0, comment || '']
    );

    // Обновляем счетчик тренировок у пользователя (только если посетил)
    if (attended) {
      await database.run(
        `UPDATE users 
         SET updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [clientId]
      );
    }

    // Получаем созданную тренировку с данными тренера
    const newTraining = await database.get(
      `SELECT t.*, u.name as coach_name, c.name as client_name
       FROM trainings t
       JOIN users u ON t.coach_id = u.id
       JOIN users c ON t.user_id = c.id
       WHERE t.id = ?`,
      [result.id]
    );

    // Получаем обновленную статистику клиента
    const clientStats = await database.get(
      `SELECT 
         COUNT(*) as total_trainings,
         COUNT(CASE WHEN attended = 1 THEN 1 END) as attended_trainings
       FROM trainings 
       WHERE user_id = ?`,
      [clientId]
    );

    // Рассчитываем грейд
    const totalTrainings = clientStats.attended_trainings;
    const { grade } = getGradeInfo(totalTrainings);

    res.json({
      success: true,
      message: 'Тренировка успешно добавлена',
      training: newTraining,
      clientStats: {
        totalTrainings: clientStats.total_trainings,
        attendedTrainings: clientStats.attended_trainings,
        grade
      }
    });

  } catch (error) {
    console.error('Ошибка добавления тренировки:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// GET /api/trainings - Получить тренировки с фильтрацией
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { clientId, coachId, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = '';
    let params = [];

    // Ограничения доступа по ролям
    if (userRole === 'client') {
      // Клиент видит только свои тренировки
      whereClause = 'WHERE t.user_id = ?';
      params.push(userId);
    } else if (userRole === 'coach') {
      // Тренер видит тренировки своих клиентов или указанного клиента
      if (clientId) {
        whereClause = 'WHERE t.user_id = ? AND t.coach_id = ?';
        params.push(clientId, userId);
      } else {
        whereClause = 'WHERE t.coach_id = ?';
        params.push(userId);
      }
    } else if (userRole === 'admin') {
      // Админ видит все тренировки или с фильтрацией
      if (clientId) {
        whereClause = 'WHERE t.user_id = ?';
        params.push(clientId);
      } else if (coachId) {
        whereClause = 'WHERE t.coach_id = ?';
        params.push(coachId);
      }
    }

    const trainings = await database.all(
      `SELECT t.*, 
              u.name as coach_name, u.email as coach_email,
              c.name as client_name, c.email as client_email
       FROM trainings t
       JOIN users u ON t.coach_id = u.id
       JOIN users c ON t.user_id = c.id
       ${whereClause}
       ORDER BY t.training_date DESC, t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Подсчитываем общее количество записей для пагинации
    const totalResult = await database.get(
      `SELECT COUNT(*) as total FROM trainings t ${whereClause}`,
      params
    );

    res.json({
      success: true,
      trainings,
      pagination: {
        total: totalResult.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalResult.total > (parseInt(offset) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Ошибка получения тренировок:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// GET /api/trainings/stats/:clientId - Статистика тренировок клиента
router.get('/stats/:clientId', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Проверяем права доступа
    if (userRole === 'client' && parseInt(clientId) !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Недостаточно прав для просмотра статистики' 
      });
    }

    // Проверяем что клиент существует
    const client = await database.get(
      'SELECT id, name, email FROM users WHERE id = ? AND role = "client"',
      [clientId]
    );

    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: 'Клиент не найден' 
      });
    }

    // Получаем общую статистику
    const totalStats = await database.get(
      `SELECT 
         COUNT(*) as total_trainings,
         COUNT(CASE WHEN attended = 1 THEN 1 END) as attended_trainings,
         COUNT(CASE WHEN attended = 0 THEN 1 END) as missed_trainings,
         COUNT(CASE WHEN training_date >= date('now', '-30 days') THEN 1 END) as last_month_trainings
       FROM trainings 
       WHERE user_id = ?`,
      [clientId]
    );

    // Статистика по типам тренировок
    const typeStats = await database.all(
      `SELECT training_type, COUNT(*) as count
       FROM trainings 
       WHERE user_id = ? AND attended = 1
       GROUP BY training_type
       ORDER BY count DESC`,
      [clientId]
    );

    // Последние 5 тренировок
    const recentTrainings = await database.all(
      `SELECT t.*, u.name as coach_name
       FROM trainings t
       JOIN users u ON t.coach_id = u.id
       WHERE t.user_id = ?
       ORDER BY t.training_date DESC, t.created_at DESC
       LIMIT 5`,
      [clientId]
    );

    // Рассчитываем грейд на основе посещенных тренировок
    const totalTrainings = totalStats.attended_trainings;
    const { grade, progress } = getGradeInfo(totalTrainings);

    res.json({
      success: true,
      clientInfo: client,
      stats: {
        ...totalStats,
        grade,
        progress
      },
      typeStats,
      recentTrainings
    });

  } catch (error) {
    console.error('Ошибка получения статистики тренировок:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// PUT /api/trainings/:id - Обновить тренировку
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { trainingDate, trainingType, attended, comment } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Получаем тренировку
    const training = await database.get(
      'SELECT * FROM trainings WHERE id = ?',
      [id]
    );

    if (!training) {
      return res.status(404).json({ 
        success: false, 
        message: 'Тренировка не найдена' 
      });
    }

    // Проверяем права доступа
    if (userRole === 'coach' && training.coach_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Можно редактировать только свои тренировки' 
      });
    } else if (userRole === 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Клиенты не могут редактировать тренировки' 
      });
    }

    // Обновляем тренировку
    await database.run(
      `UPDATE trainings 
       SET training_date = COALESCE(?, training_date),
           training_type = COALESCE(?, training_type),
           attended = COALESCE(?, attended),
           comment = COALESCE(?, comment)
       WHERE id = ?`,
      [trainingDate, trainingType, attended, comment, id]
    );

    // Получаем обновленную тренировку
    const updatedTraining = await database.get(
      `SELECT t.*, u.name as coach_name, c.name as client_name
       FROM trainings t
       JOIN users u ON t.coach_id = u.id
       JOIN users c ON t.user_id = c.id
       WHERE t.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Тренировка успешно обновлена',
      training: updatedTraining
    });

  } catch (error) {
    console.error('Ошибка обновления тренировки:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// DELETE /api/trainings/:id - Удалить тренировку
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Получаем тренировку
    const training = await database.get(
      'SELECT * FROM trainings WHERE id = ?',
      [id]
    );

    if (!training) {
      return res.status(404).json({ 
        success: false, 
        message: 'Тренировка не найдена' 
      });
    }

    // Проверяем права доступа
    if (userRole === 'coach' && training.coach_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Можно удалять только свои тренировки' 
      });
    } else if (userRole === 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Клиенты не могут удалять тренировки' 
      });
    }

    // Удаляем тренировку
    await database.run('DELETE FROM trainings WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Тренировка успешно удалена'
    });

  } catch (error) {
    console.error('Ошибка удаления тренировки:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

module.exports = router;