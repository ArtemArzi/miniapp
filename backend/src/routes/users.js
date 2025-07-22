const express = require('express');
const database = require('../models/database');
const { authenticateToken, requireCoachOrAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Получение списка пользователей (для тренеров - только клиенты)
router.get('/', authenticateToken, requireCoachOrAdmin, async (req, res) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;

    let whereClause = 'WHERE u.is_active = 1';
    let params = [];

    // Фильтр по роли
    if (role && ['client', 'coach', 'admin'].includes(role)) {
      whereClause += ' AND u.role = ?';
      params.push(role);
    } else if (req.user.role === 'coach') {
      // Тренеры видят только клиентов
      whereClause += ' AND u.role = "client"';
    }

    // Поиск по имени или email
    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Добавляем лимит и оффсет
    params.push(parseInt(limit), parseInt(offset));

    const users = await database.all(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.phone,
        u.created_at as createdAt,
        COUNT(t.id) as totalTrainings,
        MAX(t.training_date) as lastTraining,
        COUNT(CASE WHEN tc.is_read = 0 THEN 1 END) as unreadComments
      FROM users u
      LEFT JOIN trainings t ON u.id = t.user_id AND t.attended = 1
      LEFT JOIN trainer_comments tc ON u.id = tc.user_id
      ${whereClause}
      GROUP BY u.id, u.email, u.name, u.role, u.phone, u.created_at
      ORDER BY u.name
      LIMIT ? OFFSET ?
    `, params);

    // Подсчитываем общее количество
    const countParams = params.slice(0, -2); // убираем limit и offset
    const countResult = await database.get(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      ${whereClause.replace('LIMIT ? OFFSET ?', '')}
    `, countParams);

    // Для каждого клиента получаем информацию о грейде
    const usersWithGrades = await Promise.all(users.map(async (user) => {
      if (user.role === 'client') {
        // Определяем грейд на основе количества тренировок
        const gradeSystem = [
          { trainings: 0, name: "Новичок", emoji: "🥊" },
          { trainings: 10, name: "Детёныш", emoji: "🐱" },
          { trainings: 25, name: "Охотник", emoji: "🎯" },
          { trainings: 50, name: "Хищник", emoji: "🔥" },
          { trainings: 75, name: "Альфа", emoji: "👑" },
          { trainings: 100, name: "Король джунглей", emoji: "🦁" }
        ];

        let currentGrade = gradeSystem[0];
        for (let i = gradeSystem.length - 1; i >= 0; i--) {
          if (user.totalTrainings >= gradeSystem[i].trainings) {
            currentGrade = gradeSystem[i];
            break;
          }
        }

        // Проверяем заполнена ли анкета "Точка А"
        const pointAForm = await database.get(
          'SELECT id FROM point_a_forms WHERE user_id = ?',
          [user.id]
        );

        return {
          ...user,
          grade: currentGrade,
          hasCompletedPointA: !!pointAForm
        };
      }
      return user;
    }));

    res.json({
      message: 'Список пользователей получен успешно',
      users: usersWithGrades,
      pagination: {
        total: countResult.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < countResult.count
      }
    });

  } catch (error) {
    console.error('Ошибка получения списка пользователей:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении списка пользователей' 
    });
  }
});

// GET /api/users/dashboard - Получение данных для дашборда клиента
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Только для клиентов
    if (req.user.role !== 'client') {
      return res.status(403).json({ 
        error: 'Дашборд доступен только клиентам' 
      });
    }

    // Общая статистика тренировок
    const trainingStats = await database.get(`
      SELECT 
        COUNT(t.id) as totalTrainings,
        MAX(t.training_date) as lastTraining,
        COUNT(CASE WHEN t.training_date >= DATE('now', '-7 days') THEN 1 END) as trainingsThisWeek,
        COUNT(CASE WHEN t.training_date >= DATE('now', '-30 days') THEN 1 END) as trainingsThisMonth
      FROM trainings t
      WHERE t.user_id = ? AND t.attended = 1
    `, [userId]);

    // Определяем грейд
    const gradeSystem = [
      { trainings: 0, name: "Новичок", emoji: "🥊", color: "bg-gray-100 text-gray-800" },
      { trainings: 10, name: "Детёныш", emoji: "🐱", color: "bg-blue-100 text-blue-800" },
      { trainings: 25, name: "Охотник", emoji: "🎯", color: "bg-green-100 text-green-800" },
      { trainings: 50, name: "Хищник", emoji: "🔥", color: "bg-orange-100 text-orange-800" },
      { trainings: 75, name: "Альфа", emoji: "👑", color: "bg-purple-100 text-purple-800" },
      { trainings: 100, name: "Король джунглей", emoji: "🦁", color: "bg-yellow-100 text-yellow-800" }
    ];

    let currentGrade = gradeSystem[0];
    let nextGrade = null;
    let progressToNextGrade = 0;

    for (let i = gradeSystem.length - 1; i >= 0; i--) {
      if (trainingStats.totalTrainings >= gradeSystem[i].trainings) {
        currentGrade = gradeSystem[i];
        if (i < gradeSystem.length - 1) {
          nextGrade = gradeSystem[i + 1];
          progressToNextGrade = ((trainingStats.totalTrainings - currentGrade.trainings) / 
                                (nextGrade.trainings - currentGrade.trainings)) * 100;
        }
        break;
      }
    }

    // Последние комментарии от тренеров
    const recentComments = await database.all(`
      SELECT 
        tc.id,
        tc.comment_text as text,
        tc.is_read as isRead,
        tc.created_at as createdAt,
        u.name as coachName,
        t.training_type as trainingType
      FROM trainer_comments tc
      JOIN users u ON tc.coach_id = u.id
      LEFT JOIN trainings t ON tc.training_id = t.id
      WHERE tc.user_id = ?
      ORDER BY tc.created_at DESC
      LIMIT 5
    `, [userId]);

    // Количество непрочитанных комментариев
    const unreadCount = await database.get(`
      SELECT COUNT(*) as count
      FROM trainer_comments
      WHERE user_id = ? AND is_read = 0
    `, [userId]);

    // Получаем полные данные анкеты "Точка А" с детальными показателями
    const pointAForm = await database.get(`
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

    // Получаем последний прогресс пользователя для сравнения с Point A
    const latestProgress = await database.get(`
      SELECT 
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
        created_at as createdAt
      FROM progress_updates 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    console.log(`📋 Дашборд для ${req.user.name}: ${trainingStats.totalTrainings} тренировок, грейд: ${currentGrade.name}`);

    res.json({
      message: 'Данные дашборда получены успешно',
      dashboard: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        },
        stats: {
          totalTrainings: trainingStats.totalTrainings || 0,
          trainingsThisWeek: trainingStats.trainingsThisWeek || 0,
          trainingsThisMonth: trainingStats.trainingsThisMonth || 0,
          lastTraining: trainingStats.lastTraining
        },
        grade: {
          current: currentGrade,
          next: nextGrade,
          progressToNext: Math.round(progressToNextGrade),
          allGrades: gradeSystem
        },
        pointA: pointAForm,
        currentProgress: latestProgress,
        recentComments,
        notifications: {
          unreadComments: unreadCount.count || 0
        },
        hasCompletedPointA: !!pointAForm
      }
    });

  } catch (error) {
    console.error('Ошибка получения дашборда:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении дашборда' 
    });
  }
});

// GET /api/users/community - Получение публичных профилей для сообщества
router.get('/community', authenticateToken, async (req, res) => {
  try {
    const { search, industry, limit = 50, offset = 0 } = req.query;

    let whereClause = 'WHERE u.is_active = 1 AND u.role = "client" AND up.is_public = 1';
    let params = [];

    // Поиск по имени, компании или экспертизе
    if (search) {
      whereClause += ' AND (u.name LIKE ? OR up.company LIKE ? OR up.industry LIKE ? OR up.expertise_offer LIKE ? OR up.expertise_seeking LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Фильтр по индустрии
    if (industry) {
      whereClause += ' AND up.industry LIKE ?';
      params.push(`%${industry}%`);
    }

    // Добавляем лимит и оффсет
    params.push(parseInt(limit), parseInt(offset));

    const communityMembers = await database.all(`
      SELECT 
        u.id,
        u.name,
        u.email,
        up.company,
        up.industry,
        up.expertise_offer as canHelp,
        up.expertise_seeking as lookingFor,
        up.linkedin_url as linkedinUrl,
        up.telegram_username as telegramUsername,
        COUNT(t.id) as totalTrainings,
        MAX(t.training_date) as lastTraining
      FROM users u
      INNER JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN trainings t ON u.id = t.user_id AND t.attended = 1
      ${whereClause}
      GROUP BY u.id, u.name, u.email, up.company, up.industry, up.expertise_offer, up.expertise_seeking, up.linkedin_url, up.telegram_username
      ORDER BY u.name
      LIMIT ? OFFSET ?
    `, params);

    // Добавляем грейды для каждого участника
    const membersWithGrades = communityMembers.map(member => {
      // Определяем грейд на основе количества тренировок
      const gradeSystem = [
        { trainings: 0, name: "Новичок", emoji: "🥊" },
        { trainings: 10, name: "Детёныш", emoji: "🐱" },
        { trainings: 25, name: "Охотник", emoji: "🎯" },
        { trainings: 50, name: "Хищник", emoji: "🔥" },
        { trainings: 75, name: "Альфа", emoji: "👑" },
        { trainings: 100, name: "Король джунглей", emoji: "🦁" }
      ];

      let currentGrade = gradeSystem[0];
      for (let i = gradeSystem.length - 1; i >= 0; i--) {
        if (member.totalTrainings >= gradeSystem[i].trainings) {
          currentGrade = gradeSystem[i];
          break;
        }
      }

      // Создаем инициалы для аватара
      const nameParts = member.name.split(' ');
      const avatar = nameParts.length >= 2 
        ? nameParts[0][0] + nameParts[1][0] 
        : nameParts[0][0] + (nameParts[0][1] || '');

      return {
        ...member,
        grade: currentGrade,
        avatar: avatar.toUpperCase(),
        isPublic: true // все профили в этом списке публичные
      };
    });

    // Подсчитываем общее количество
    const countParams = params.slice(0, -2); // убираем limit и offset
    const countResult = await database.get(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      INNER JOIN user_profiles up ON u.id = up.user_id
      ${whereClause.replace('LIMIT ? OFFSET ?', '')}
    `, countParams);

    console.log(`🏘️ Загружено ${membersWithGrades.length} участников сообщества`);

    res.json({
      message: 'Список участников сообщества получен успешно',
      members: membersWithGrades,
      pagination: {
        total: countResult.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < countResult.count
      }
    });

  } catch (error) {
    console.error('Ошибка получения участников сообщества:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении участников сообщества' 
    });
  }
});

// GET /api/users/:userId - Получение детальной информации о пользователе
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Проверяем права доступа
    if (req.user.role === 'client' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'Недостаточно прав для просмотра этого профиля' 
      });
    }

    const user = await database.get(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.phone,
        u.avatar_url,
        u.created_at as createdAt,
        up.company,
        up.industry,
        up.expertise_offer as expertiseOffer,
        up.expertise_seeking as expertiseSeeking,
        up.is_public as isPublic,
        up.linkedin_url as linkedinUrl,
        up.telegram_username as telegramUsername
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? AND u.is_active = 1
    `, [userId]);

    if (!user) {
      return res.status(404).json({ 
        error: 'Пользователь не найден' 
      });
    }

    // Получаем статистику тренировок для клиентов
    let stats = null;
    if (user.role === 'client') {
      const trainingStats = await database.get(`
        SELECT 
          COUNT(t.id) as totalTrainings,
          MAX(t.training_date) as lastTraining,
          COUNT(CASE WHEN t.training_date >= DATE('now', '-7 days') THEN 1 END) as trainingsThisWeek,
          COUNT(CASE WHEN t.training_date >= DATE('now', '-30 days') THEN 1 END) as trainingsThisMonth
        FROM trainings t
        WHERE t.user_id = ? AND t.attended = 1
      `, [userId]);

      // Определяем грейд
      const gradeSystem = [
        { trainings: 0, name: "Новичок", emoji: "🥊" },
        { trainings: 10, name: "Детёныш", emoji: "🐱" },
        { trainings: 25, name: "Охотник", emoji: "🎯" },
        { trainings: 50, name: "Хищник", emoji: "🔥" },
        { trainings: 75, name: "Альфа", emoji: "👑" },
        { trainings: 100, name: "Король джунглей", emoji: "🦁" }
      ];

      let currentGrade = gradeSystem[0];
      let nextGrade = null;

      for (let i = gradeSystem.length - 1; i >= 0; i--) {
        if (trainingStats.totalTrainings >= gradeSystem[i].trainings) {
          currentGrade = gradeSystem[i];
          if (i < gradeSystem.length - 1) {
            nextGrade = gradeSystem[i + 1];
          }
          break;
        }
      }

      // Проверяем анкету "Точка А"
      const pointAForm = await database.get(
        'SELECT id FROM point_a_forms WHERE user_id = ?',
        [userId]
      );

      stats = {
        ...trainingStats,
        currentGrade,
        nextGrade,
        hasCompletedPointA: !!pointAForm
      };
    }

    res.json({
      message: 'Информация о пользователе получена успешно',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        createdAt: user.createdAt,
        profile: {
          company: user.company,
          industry: user.industry,
          expertiseOffer: user.expertiseOffer,
          expertiseSeeking: user.expertiseSeeking,
          isPublic: !!user.isPublic,
          linkedinUrl: user.linkedinUrl,
          telegramUsername: user.telegramUsername
        }
      },
      stats
    });

  } catch (error) {
    console.error('Ошибка получения информации о пользователе:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении информации о пользователе' 
    });
  }
});

// GET /api/users/:userId/stats - Получение статистики пользователя
router.get('/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Проверяем права доступа
    if (req.user.role === 'client' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ 
        error: 'Недостаточно прав для просмотра этой статистики' 
      });
    }

    // Проверяем что пользователь существует и является клиентом
    const user = await database.get(
      'SELECT id, name, role FROM users WHERE id = ? AND role = "client" AND is_active = 1',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ 
        error: 'Клиент не найден' 
      });
    }

    // Получаем детальную статистику
    const stats = await database.get(`
      SELECT 
        COUNT(t.id) as totalTrainings,
        MAX(t.training_date) as lastTraining,
        MIN(t.training_date) as firstTraining,
        COUNT(CASE WHEN t.training_date >= DATE('now', '-7 days') THEN 1 END) as trainingsThisWeek,
        COUNT(CASE WHEN t.training_date >= DATE('now', '-30 days') THEN 1 END) as trainingsThisMonth,
        COUNT(CASE WHEN t.training_date >= DATE('now', '-90 days') THEN 1 END) as trainingsThisQuarter
      FROM trainings t
      WHERE t.user_id = ? AND t.attended = 1
    `, [userId]);

    // Получаем количество комментариев
    const commentStats = await database.get(`
      SELECT 
        COUNT(*) as totalComments,
        COUNT(CASE WHEN is_read = 0 THEN 1 END) as unreadComments
      FROM trainer_comments
      WHERE user_id = ?
    `, [userId]);

    // Статистика по типам тренировок за последний месяц
    const trainingTypes = await database.all(`
      SELECT 
        training_type,
        COUNT(*) as count
      FROM trainings
      WHERE user_id = ? AND attended = 1 AND training_date >= DATE('now', '-30 days')
      GROUP BY training_type
      ORDER BY count DESC
    `, [userId]);

    res.json({
      message: 'Статистика пользователя получена успешно',
      user: {
        id: user.id,
        name: user.name
      },
      stats: {
        ...stats,
        ...commentStats,
        trainingTypes
      }
    });

  } catch (error) {
    console.error('Ошибка получения статистики пользователя:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении статистики пользователя' 
    });
  }
});

// PUT /api/users/profile - Обновление профиля пользователя
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      phone,
      company,
      industry,
      canHelp,
      lookingFor,
      isPublic,
      linkedIn,
      telegram,
      bio
    } = req.body;

    // Начинаем транзакцию
    await database.run('BEGIN TRANSACTION');

    try {
      // Обновляем основную информацию в таблице users
      if (name || phone) {
        await database.run(
          `UPDATE users 
           SET name = COALESCE(?, name), 
               phone = COALESCE(?, phone),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [name || null, phone || null, userId]
        );
      }

      // Проверяем существует ли профиль в user_profiles
      const existingProfile = await database.get(
        'SELECT id FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      if (existingProfile) {
        // Обновляем существующий профиль
        await database.run(
          `UPDATE user_profiles 
           SET company = COALESCE(?, company),
               industry = COALESCE(?, industry),
               expertise_offer = COALESCE(?, expertise_offer),
               expertise_seeking = COALESCE(?, expertise_seeking),
               is_public = COALESCE(?, is_public),
               linkedin_url = COALESCE(?, linkedin_url),
               telegram_username = COALESCE(?, telegram_username),
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [
            company || null,
            industry || null,
            canHelp || null,
            lookingFor || null,
            isPublic !== undefined ? (isPublic ? 1 : 0) : null,
            linkedIn || null,
            telegram || null,
            userId
          ]
        );
      } else {
        // Создаем новый профиль
        await database.run(
          `INSERT INTO user_profiles (
            user_id, company, industry, expertise_offer, expertise_seeking, 
            is_public, linkedin_url, telegram_username
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            company || null,
            industry || null,
            canHelp || null,
            lookingFor || null,
            isPublic ? 1 : 0,
            linkedIn || null,
            telegram || null
          ]
        );
      }

      // Подтверждаем транзакцию
      await database.run('COMMIT');

      // Получаем обновленный профиль
      const updatedUser = await database.get(`
        SELECT 
          u.id,
          u.email,
          u.name,
          u.phone,
          u.role,
          u.avatar_url,
          u.created_at as createdAt,
          up.company,
          up.industry,
          up.expertise_offer as canHelp,
          up.expertise_seeking as lookingFor,
          up.is_public as isPublic,
          up.linkedin_url as linkedIn,
          up.telegram_username as telegram
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = ?
      `, [userId]);

      console.log(`✅ Профиль обновлен для пользователя ${req.user.name} (ID: ${userId})`);

      res.json({
        message: 'Профиль успешно обновлен',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          role: updatedUser.role,
          avatarUrl: updatedUser.avatar_url,
          createdAt: updatedUser.createdAt,
          profile: {
            company: updatedUser.company,
            industry: updatedUser.industry,
            canHelp: updatedUser.canHelp,
            lookingFor: updatedUser.lookingFor,
            isPublic: !!updatedUser.isPublic,
            linkedIn: updatedUser.linkedIn,
            telegram: updatedUser.telegram
          }
        }
      });

    } catch (error) {
      // Откатываем транзакцию в случае ошибки
      await database.run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при обновлении профиля' 
    });
  }
});

// GET /api/users/:id - Получение данных пользователя по ID (для тренеров)
router.get('/:id', authenticateToken, requireCoachOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Получаем основные данные пользователя
    const user = await database.get(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.is_active,
        u.created_at,
        COUNT(t.id) as totalTrainings,
        MAX(t.date) as lastTrainingDate
      FROM users u
      LEFT JOIN trainings t ON u.id = t.user_id
      WHERE u.id = ? AND u.is_active = 1
      GROUP BY u.id
    `, [id]);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Пользователь не найден' 
      });
    }

    // Определяем систему званий
    const gradeSystem = [
      { trainings: 0, name: "Новичок", emoji: "🥊" },
      { trainings: 10, name: "Детёныш", emoji: "🐱" },
      { trainings: 25, name: "Охотник", emoji: "🎯" },
      { trainings: 50, name: "Хищник", emoji: "🔥" },
      { trainings: 75, name: "Альфа", emoji: "👑" },
      { trainings: 100, name: "Король джунглей", emoji: "🦁" }
    ];

    let currentGrade = gradeSystem[0];
    for (let i = gradeSystem.length - 1; i >= 0; i--) {
      if (user.totalTrainings >= gradeSystem[i].trainings) {
        currentGrade = gradeSystem[i];
        break;
      }
    }

    // Форматируем дату последней тренировки
    let lastTraining = 'Нет тренировок';
    if (user.lastTrainingDate) {
      const lastDate = new Date(user.lastTrainingDate);
      const today = new Date();
      const diffDays = Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        lastTraining = 'Сегодня';
      } else if (diffDays === 1) {
        lastTraining = 'Вчера';
      } else if (diffDays < 7) {
        lastTraining = `${diffDays} дня назад`;
      } else {
        lastTraining = lastDate.toLocaleDateString('ru-RU');
      }
    }

    res.json({
      message: 'Данные пользователя получены успешно',
      user: {
        ...user,
        grade: currentGrade,
        joinDate: user.created_at,
        lastTraining: lastTraining
      }
    });

  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении данных пользователя' 
    });
  }
});

module.exports = router;
