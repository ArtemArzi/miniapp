const express = require('express');
const router = express.Router();
const database = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

// Функция для расчета общего прогресса по формуле из ТЗ
function calculateOverallProgress(pointAData, currentData) {
  try {
    // Определяем поля для расчета (только субъективные оценки 1-10)
    const subjectiveFields = [
      'energy_level',
      'stress_level',
      'sleep_quality', 
      'nutrition_quality',
      'emotions_level',
      'intimacy_level'
    ];

    // Собираем значения "Точки А"
    const pointAValues = [];
    const currentValues = [];

    subjectiveFields.forEach(field => {
      const pointAValue = pointAData[field];
      const currentValue = currentData[field];
      
      if (pointAValue && currentValue) {
        // Для стресса инвертируем значение (меньше стресс = лучше)
        if (field === 'stress_level') {
          pointAValues.push(11 - pointAValue); // Инвертируем: 10 становится 1, 1 становится 10
          currentValues.push(11 - currentValue);
        } else {
          pointAValues.push(pointAValue);
          currentValues.push(currentValue);
        }
      }
    });

    // Проверяем что есть данные для расчета
    if (pointAValues.length === 0 || currentValues.length === 0) {
      return 0;
    }

    // Рассчитываем средние значения
    const avgPointA = pointAValues.reduce((sum, val) => sum + val, 0) / pointAValues.length;
    const avgCurrent = currentValues.reduce((sum, val) => sum + val, 0) / currentValues.length;

    // Применяем формулу из ТЗ: (Среднее текущее - Среднее А) / (10 - Среднее А) * 100
    const overallProgress = ((avgCurrent - avgPointA) / (10 - avgPointA)) * 100;

    // Ограничиваем значение от 0 до 100
    return Math.max(0, Math.min(100, Math.round(overallProgress * 100) / 100));
    
  } catch (error) {
    console.error('Ошибка расчета общего прогресса:', error);
    return 0;
  }
}

// POST /api/progress - Обновить показатели прогресса
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
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
      intimacy_level
    } = req.body;

    // Проверяем что пользователь - клиент
    if (userRole !== 'client') {
      return res.status(403).json({ 
        success: false, 
        message: 'Только клиенты могут обновлять свой прогресс' 
      });
    }

    // Валидация данных (хотя бы одно поле должно быть заполнено)
    const hasData = weight || body_fat_percentage || plank_time || punches_per_minute ||
                   energy_level || stress_level || sleep_quality || nutrition_quality ||
                   emotions_level || intimacy_level;

    if (!hasData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Необходимо заполнить хотя бы одно поле' 
      });
    }

    // Валидация субъективных оценок (1-10)
    const subjectiveFields = [energy_level, stress_level, sleep_quality, nutrition_quality, emotions_level, intimacy_level];
    for (const field of subjectiveFields) {
      if (field !== undefined && (field < 1 || field > 10)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Субъективные оценки должны быть от 1 до 10' 
        });
      }
    }

    // Добавляем запись прогресса
    const result = await database.run(
      `INSERT INTO progress_updates (
        user_id, weight, body_fat_percentage, plank_time, punches_per_minute,
        energy_level, stress_level, sleep_quality, nutrition_quality, emotions_level, intimacy_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, weight, body_fat_percentage, plank_time, punches_per_minute,
        energy_level, stress_level, sleep_quality, nutrition_quality, emotions_level, intimacy_level
      ]
    );

    // Получаем созданную запись
    const newProgress = await database.get(
      `SELECT * FROM progress_updates WHERE id = ?`,
      [result.id]
    );

    // Получаем "Точку А" для сравнения
    const pointA = await database.get(
      'SELECT * FROM point_a_forms WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    // Рассчитываем улучшения если есть "Точка А"
    let improvements = {};
    if (pointA) {
      const metrics = [
        { field: 'weight', better: 'lower' },
        { field: 'body_fat_percentage', better: 'lower' },
        { field: 'plank_time', better: 'higher' },
        { field: 'punches_per_minute', better: 'higher' },
        { field: 'energy_level', better: 'higher' },
        { field: 'stress_level', better: 'lower' },
        { field: 'sleep_quality', better: 'higher' },
        { field: 'nutrition_quality', better: 'higher' },
        { field: 'emotions_level', better: 'higher' },
        { field: 'intimacy_level', better: 'higher' }
      ];

      for (const metric of metrics) {
        const currentValue = newProgress[metric.field];
        const pointAValue = pointA[metric.field];
        
        if (currentValue && pointAValue) {
          const isImproved = metric.better === 'higher' 
            ? currentValue > pointAValue 
            : currentValue < pointAValue;
          
          const percentChange = metric.better === 'higher'
            ? ((currentValue - pointAValue) / pointAValue) * 100
            : ((pointAValue - currentValue) / pointAValue) * 100;
          
          improvements[metric.field] = {
            improved: isImproved,
            percentChange: Math.round(percentChange * 10) / 10,
            pointA: pointAValue,
            current: currentValue
          };
        }
      }
    }

    res.json({
      success: true,
      message: 'Показатели прогресса успешно обновлены',
      progress: newProgress,
      improvements,
      hasPointA: !!pointA
    });

  } catch (error) {
    console.error('Ошибка обновления прогресса:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// GET /api/progress - Получить историю прогресса
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    
    // Определяем для кого получаем прогресс
    let targetUserId = requesterId;
    
    if (userId) {
      // Проверяем права доступа
      if (requesterRole === 'client' && parseInt(userId) !== requesterId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Недостаточно прав для просмотра чужого прогресса' 
        });
      }
      targetUserId = parseInt(userId);
    }

    // Проверяем что пользователь существует
    const user = await database.get(
      'SELECT id, name, email FROM users WHERE id = ?',
      [targetUserId]
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Получаем историю прогресса
    const progressHistory = await database.all(
      `SELECT * FROM progress_updates 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [targetUserId]
    );

    // Получаем "Точку А"
    const pointA = await database.get(
      'SELECT * FROM point_a_forms WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [targetUserId]
    );

    // Получаем последние показатели
    const latestProgress = progressHistory.length > 0 ? progressHistory[0] : null;

    res.json({
      success: true,
      user,
      pointA,
      latestProgress,
      progressHistory
    });

  } catch (error) {
    console.error('Ошибка получения прогресса:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// GET /api/progress/latest/:userId - Получить последние показатели пользователя
router.get('/latest/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // Проверяем права доступа
    if (requesterRole === 'client' && parseInt(userId) !== requesterId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Недостаточно прав для просмотра чужого прогресса' 
      });
    }
    
    // Тренеры и админы могут смотреть прогресс любого пользователя
    // Клиенты могут смотреть только свой прогресс (проверка выше)

    // Получаем последнюю запись прогресса
    const latestProgress = await database.get(
      `SELECT * FROM progress_updates 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    // Получаем "Точку А"
    const pointA = await database.get(
      'SELECT * FROM point_a_forms WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    res.json({
      success: true,
      latestProgress,
      pointA
    });

  } catch (error) {
    console.error('Ошибка получения последнего прогресса:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// GET /api/progress/comparison/:userId - Сравнение прогресса с "Точкой А"
router.get('/comparison/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // Проверяем права доступа
    if (requesterRole === 'client' && parseInt(userId) !== requesterId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Недостаточно прав для просмотра чужого прогресса' 
      });
    }

    // Получаем "Точку А"
    const pointA = await database.get(
      'SELECT * FROM point_a_forms WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!pointA) {
      return res.status(404).json({ 
        success: false, 
        message: 'Анкета "Точка А" не найдена' 
      });
    }

    // Получаем последний прогресс
    const latestProgress = await database.get(
      `SELECT * FROM progress_updates 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    // Рассчитываем сравнение
    const metrics = [
      { field: 'weight', label: 'Вес', unit: 'кг', better: 'lower' },
      { field: 'body_fat_percentage', label: 'Жир', unit: '%', better: 'lower' },
      { field: 'plank_time', label: 'Планка', unit: 'сек', better: 'higher' },
      { field: 'punches_per_minute', label: 'Удары/мин', unit: '', better: 'higher' },
      { field: 'energy_level', label: 'Энергия', unit: '/10', better: 'higher' },
      { field: 'stress_level', label: 'Стресс', unit: '/10', better: 'lower' },
      { field: 'sleep_quality', label: 'Сон', unit: '/10', better: 'higher' },
      { field: 'nutrition_quality', label: 'Питание', unit: '/10', better: 'higher' },
      { field: 'emotions_level', label: 'Эмоции', unit: '/10', better: 'higher' },
      { field: 'intimacy_level', label: 'Интимность', unit: '/10', better: 'higher' }
    ];

    const comparison = metrics.map(metric => {
      const pointAValue = pointA[metric.field];
      const currentValue = latestProgress ? latestProgress[metric.field] : null;
      
      let isImproved = false;
      let percentChange = 0;
      
      if (pointAValue && currentValue) {
        isImproved = metric.better === 'higher' 
          ? currentValue > pointAValue 
          : currentValue < pointAValue;
        
        percentChange = metric.better === 'higher'
          ? ((currentValue - pointAValue) / pointAValue) * 100
          : ((pointAValue - currentValue) / pointAValue) * 100;
      }
      
      return {
        ...metric,
        pointA: pointAValue,
        current: currentValue,
        improved: isImproved,
        percentChange: Math.round(percentChange * 10) / 10,
        hasData: !!(pointAValue && currentValue)
      };
    });

    // Рассчитываем общий прогресс по формуле из ТЗ
    const overallProgress = latestProgress ? calculateOverallProgress(pointA, latestProgress) : 0;

    res.json({
      success: true,
      pointA,
      latestProgress,
      comparison,
      overallImprovement: comparison.filter(m => m.hasData && m.improved).length,
      overallProgress // Добавляем общий прогресс
    });

  } catch (error) {
    console.error('Ошибка сравнения прогресса:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// GET /api/progress/overall/:userId - Получить общий прогресс пользователя
router.get('/overall/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // Проверяем права доступа
    if (requesterRole === 'client' && parseInt(userId) !== requesterId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Недостаточно прав для просмотра чужого прогресса' 
      });
    }
    
    // Тренеры и админы могут смотреть прогресс любого пользователя
    // Клиенты могут смотреть только свой прогресс (проверка выше)

    // Получаем "Точку А"
    const pointA = await database.get(
      'SELECT * FROM point_a_forms WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!pointA) {
      return res.status(404).json({ 
        success: false, 
        message: 'Анкета "Точка А" не найдена' 
      });
    }

    // Получаем последний прогресс
    const latestProgress = await database.get(
      `SELECT * FROM progress_updates 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    // Рассчитываем общий прогресс
    const overallProgress = latestProgress ? calculateOverallProgress(pointA, latestProgress) : 0;

    res.json({
      success: true,
      overallProgress,
      hasData: !!latestProgress,
      pointA: {
        energy_level: pointA.energy_level,
        stress_level: pointA.stress_level,
        sleep_quality: pointA.sleep_quality,
        nutrition_quality: pointA.nutrition_quality,
        emotions_level: pointA.emotions_level,
        intimacy_level: pointA.intimacy_level
      },
      current: latestProgress ? {
        energy_level: latestProgress.energy_level,
        stress_level: latestProgress.stress_level,
        sleep_quality: latestProgress.sleep_quality,
        nutrition_quality: latestProgress.nutrition_quality,
        emotions_level: latestProgress.emotions_level,
        intimacy_level: latestProgress.intimacy_level
      } : null
    });

  } catch (error) {
    console.error('Ошибка получения общего прогресса:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

module.exports = router;