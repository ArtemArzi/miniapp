const express = require('express');
const database = require('../models/database');
const { authenticateToken, requireCoachOrAdmin } = require('../middleware/auth');
const { validatePointAForm } = require('../middleware/validation');

const router = express.Router();

// POST /api/point-a - Сохранение анкеты "Точка А"
router.post('/', authenticateToken, validatePointAForm, async (req, res) => {
  console.log('📋 Полученные данные анкеты:', req.body);
  
  try {
    const userId = req.user.id;

    // Только клиенты могут заполнять анкету "Точка А"
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        error: 'Только клиенты могут заполнять анкету "Точка А"' 
      });
    }

    const {
      weight,
      body_fat_percentage,
      plank_time,
      punches_per_minute,
      energy_level,
      stress_level,
      sleep_quality,
      nutrition_quality,
      emotions_level,
      intimacy_level,
      goal_description
    } = req.body;

    // Проверяем существует ли уже анкета для этого пользователя
    const existingForm = await database.get(
      'SELECT id FROM point_a_forms WHERE user_id = ?',
      [userId]
    );

    if (existingForm) {
      // Обновляем существующую анкету
      await database.run(`
        UPDATE point_a_forms SET
          weight = ?,
          body_fat_percentage = ?,
          plank_time = ?,
          punches_per_minute = ?,
          energy_level = ?,
          stress_level = ?,
          sleep_quality = ?,
          nutrition_quality = ?,
          emotions_level = ?,
          intimacy_level = ?,
          goal_description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
        weight, body_fat_percentage, plank_time, punches_per_minute,
        energy_level, stress_level, sleep_quality, nutrition_quality, emotions_level, intimacy_level,
        goal_description, userId
      ]);

      console.log(`✏️ Обновлена анкета "Точка А" для пользователя ${req.user.email}`);

      res.json({ 
        message: 'Анкета "Точка А" обновлена успешно',
        isUpdate: true
      });
    } else {
      // Создаем новую анкету
      const result = await database.run(`
        INSERT INTO point_a_forms (
          user_id, weight, body_fat_percentage, plank_time, punches_per_minute,
          energy_level, stress_level, sleep_quality, nutrition_quality,
          emotions_level, intimacy_level, goal_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId, weight, body_fat_percentage, plank_time, punches_per_minute,
        energy_level, stress_level, sleep_quality, nutrition_quality, emotions_level, intimacy_level, goal_description
      ]);

      console.log(`📝 Создана анкета "Точка А" для пользователя ${req.user.email} (ID: ${result.id})`);

      res.status(201).json({ 
        message: 'Анкета "Точка А" сохранена успешно',
        formId: result.id,
        isUpdate: false
      });
    }

  } catch (error) {
    console.error('Ошибка сохранения анкеты "Точка А":', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при сохранении анкеты' 
    });
  }
});

// GET /api/point-a - Получение анкеты "Точка А" текущего пользователя
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Только клиенты имеют анкеты "Точка А"
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        error: 'Только клиенты имеют анкеты "Точка А"' 
      });
    }

    const form = await database.get(`
      SELECT 
        id,
        weight,
        body_fat_percentage as bodyFatPercentage,
        plank_time as plankTime,
        punches_per_minute as punchesPerMinute,
        energy_level as energy,
        stress_level as stress,
        sleep_quality as sleep,
        nutrition_quality as nutrition,
        emotions_level as emotions,
        intimacy_level as intimacy,
        goal_description as pointBGoal,
        created_at as createdAt,
        updated_at as updatedAt
      FROM point_a_forms 
      WHERE user_id = ?
    `, [userId]);

    if (!form) {
      return res.status(404).json({ 
        error: 'Анкета "Точка А" не найдена',
        hasCompletedPointA: false
      });
    }

    res.json({
      message: 'Анкета "Точка А" получена успешно',
      form,
      hasCompletedPointA: true
    });

  } catch (error) {
    console.error('Ошибка получения анкеты "Точка А":', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении анкеты' 
    });
  }
});

// GET /api/point-a/:userId - Получение анкеты клиента (для тренеров)
router.get('/:userId', authenticateToken, requireCoachOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Проверяем что пользователь существует и является клиентом
    const user = await database.get(
      'SELECT id, name, email, role FROM users WHERE id = ? AND role = "client"',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ 
        error: 'Клиент не найден' 
      });
    }

    const form = await database.get(`
      SELECT 
        id,
        weight,
        body_fat_percentage as bodyFatPercentage,
        plank_time as plankTime,
        punches_per_minute as punchesPerMinute,
        energy_level as energy,
        stress_level as stress,
        sleep_quality as sleep,
        nutrition_quality as nutrition,
        emotions_level as emotions,
        intimacy_level as intimacy,
        goal_description as pointBGoal,
        created_at as createdAt,
        updated_at as updatedAt
      FROM point_a_forms 
      WHERE user_id = ?
    `, [userId]);

    if (!form) {
      return res.status(404).json({ 
        error: 'Анкета "Точка А" для этого клиента не найдена',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        hasCompletedPointA: false
      });
    }

    res.json({
      message: 'Анкета клиента получена успешно',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      form,
      hasCompletedPointA: true
    });

  } catch (error) {
    console.error('Ошибка получения анкеты клиента:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении анкеты клиента' 
    });
  }
});

module.exports = router;
