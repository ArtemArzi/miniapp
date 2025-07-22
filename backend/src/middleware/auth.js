const jwt = require('jsonwebtoken');
const database = require('../models/database');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Токен доступа не предоставлен' 
      });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Получаем пользователя из БД
    const user = await database.get(
      'SELECT id, email, name, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Пользователь не найден' 
      });
    }

    if (!user.is_active) {
      return res.status(401).json({ 
        error: 'Аккаунт деактивирован' 
      });
    }

    // Добавляем данные пользователя в запрос
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Токен истек' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Недействительный токен' 
      });
    }

    console.error('Ошибка аутентификации:', error);
    return res.status(500).json({ 
      error: 'Ошибка сервера при проверке токена' 
    });
  }
};

// Middleware для проверки роли пользователя
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Аутентификация требуется' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Недостаточно прав доступа' 
      });
    }

    next();
  };
};

// Middleware для проверки что пользователь тренер или админ
const requireCoachOrAdmin = requireRole(['coach', 'admin']);

// Middleware для проверки что пользователь админ
const requireAdmin = requireRole(['admin']);

// Генерация JWT токена
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { 
      userId, 
      email, 
      role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '30d' 
    }
  );
};

module.exports = {
  authenticateToken,
  requireRole,
  requireCoachOrAdmin,
  requireAdmin,
  generateToken
};
