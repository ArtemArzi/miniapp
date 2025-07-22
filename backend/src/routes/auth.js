const express = require('express');
const bcrypt = require('bcryptjs');
const database = require('../models/database');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/login - Вход в систему
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ищем пользователя в БД
    const user = await database.get(
      'SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    if (!user.is_active) {
      return res.status(401).json({ 
        error: 'Аккаунт деактивирован' 
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Генерируем JWT токен
    const token = generateToken(user.id, user.email, user.role);

    // Обновляем время последнего входа
    await database.run(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Проверяем заполнена ли анкета "Точка А" для клиентов
    let hasCompletedPointA = true;
    if (user.role === 'client') {
      const pointAForm = await database.get(
        'SELECT id FROM point_a_forms WHERE user_id = ?',
        [user.id]
      );
      hasCompletedPointA = !!pointAForm;
    }

    console.log(`✅ Успешный вход: ${user.email} (${user.role})`);
    
    // Возвращаем данные пользователя и токен
    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasCompletedPointA
      }
    });

  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при входе в систему' 
    });
  }
});

// POST /api/auth/register - Регистрация нового пользователя
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { email, password, name, role = 'client', phone, inviteCode } = req.body;

    // Коды приглашения (в продакшене лучше хранить в БД или переменных окружения)
    const INVITE_CODES = {
      coach: process.env.COACH_INVITE_CODE || 'JAGUAR_COACH_2024',
      admin: process.env.ADMIN_INVITE_CODE || 'JAGUAR_ADMIN_2024'
    };

    // Проверка кода приглашения для привилегированных ролей
    if (role === 'coach' || role === 'admin') {
      if (!inviteCode) {
        return res.status(400).json({ 
          error: `Для регистрации ${role === 'coach' ? 'тренера' : 'администратора'} требуется код приглашения` 
        });
      }

      if (inviteCode !== INVITE_CODES[role]) {
        return res.status(403).json({ 
          error: 'Неверный код приглашения' 
        });
      }
    }

    // Проверяем что пользователь с таким email не существует
    const existingUser = await database.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь с таким email уже существует' 
      });
    }

    // Хешируем пароль
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя
    const result = await database.run(
      `INSERT INTO users (email, password_hash, name, role, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, passwordHash, name, role, phone]
    );

    // Генерируем токен для нового пользователя
    const token = generateToken(result.id, email, role);

    console.log(`✅ Зарегистрирован новый пользователь: ${email} (${role})`);

    res.status(201).json({
      message: 'Регистрация выполнена успешно',
      token,
      user: {
        id: result.id,
        email,
        name,
        role,
        hasCompletedPointA: false
      }
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при регистрации' 
    });
  }
});

// GET /api/auth/profile - Получение профиля текущего пользователя
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Получаем полную информацию о пользователе
    const user = await database.get(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.role, 
        u.phone, 
        u.avatar_url,
        u.created_at,
        up.company,
        up.industry,
        up.expertise_offer,
        up.expertise_seeking,
        up.is_public,
        up.linkedin_url,
        up.telegram_username
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ 
        error: 'Пользователь не найден' 
      });
    }

    // Проверяем заполнена ли анкета "Точка А" для клиентов
    let hasCompletedPointA = true;
    if (user.role === 'client') {
      const pointAForm = await database.get(
        'SELECT id FROM point_a_forms WHERE user_id = ?',
        [userId]
      );
      hasCompletedPointA = !!pointAForm;
    }

    // Получаем статистику для клиентов
    let stats = null;
    if (user.role === 'client') {
      const trainingCount = await database.get(
        'SELECT COUNT(*) as total FROM trainings WHERE user_id = ? AND attended = 1',
        [userId]
      );

      stats = {
        totalTrainings: trainingCount.total || 0,
        hasCompletedPointA
      };
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        hasCompletedPointA,
        profile: {
          company: user.company,
          industry: user.industry,
          expertiseOffer: user.expertise_offer,
          expertiseSeeking: user.expertise_seeking,
          isPublic: !!user.is_public,
          linkedinUrl: user.linkedin_url,
          telegramUsername: user.telegram_username
        }
      },
      stats
    });

  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при получении профиля' 
    });
  }
});

// PUT /api/auth/profile - Обновление профиля пользователя
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, company, industry, expertiseOffer, expertiseSeeking, isPublic, linkedinUrl, telegramUsername } = req.body;

    // Обновляем основную информацию пользователя
    if (name || phone) {
      await database.run(
        'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, phone, userId]
      );
    }

    // Обновляем или создаем профиль пользователя
    if (company !== undefined || industry !== undefined || expertiseOffer !== undefined || 
        expertiseSeeking !== undefined || isPublic !== undefined || linkedinUrl !== undefined || 
        telegramUsername !== undefined) {
      
      // Проверяем существует ли профиль
      const existingProfile = await database.get(
        'SELECT id FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      if (existingProfile) {
        // Обновляем существующий профиль
        await database.run(`
          UPDATE user_profiles SET 
            company = COALESCE(?, company),
            industry = COALESCE(?, industry),
            expertise_offer = COALESCE(?, expertise_offer),
            expertise_seeking = COALESCE(?, expertise_seeking),
            is_public = COALESCE(?, is_public),
            linkedin_url = COALESCE(?, linkedin_url),
            telegram_username = COALESCE(?, telegram_username),
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `, [company, industry, expertiseOffer, expertiseSeeking, isPublic, linkedinUrl, telegramUsername, userId]);
      } else {
        // Создаем новый профиль
        await database.run(`
          INSERT INTO user_profiles (user_id, company, industry, expertise_offer, expertise_seeking, is_public, linkedin_url, telegram_username)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [userId, company, industry, expertiseOffer, expertiseSeeking, isPublic, linkedinUrl, telegramUsername]);
      }
    }

    res.json({ 
      message: 'Профиль обновлен успешно' 
    });

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера при обновлении профиля' 
    });
  }
});

// POST /api/auth/logout - Выход из системы (клиентский)
router.post('/logout', authenticateToken, async (req, res) => {
  // В реальном приложении здесь можно добавить черный список токенов
  // Пока что просто возвращаем успешный ответ
  res.json({ 
    message: 'Выход выполнен успешно' 
  });
});

module.exports = router;
