const { body, validationResult } = require('express-validator');

// Middleware для обработки ошибок валидации
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Ошибка валидации данных',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

// Валидация для входа
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
  
  handleValidationErrors
];

// Валидация для регистрации
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Имя должно содержать от 2 до 100 символов')
    .matches(/^[а-яёa-z\s\-'\.]+$/i)
    .withMessage('Имя может содержать буквы, пробелы, дефисы, апострофы и точки'),
  
  body('role')
    .optional()
    .isIn(['client', 'coach', 'admin'])
    .withMessage('Роль может быть только client, coach или admin'),
    
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Введите корректный номер телефона'),
    
  body('inviteCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Код приглашения должен содержать от 1 до 100 символов'),
  
  handleValidationErrors
];

// Валидация для анкеты "Точка А"
const validatePointAForm = [
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Вес должен быть от 30 до 300 кг'),
  
  body('bodyFatPercentage')
    .optional()
    .isFloat({ min: 3, max: 50 })
    .withMessage('Процент жира должен быть от 3 до 50%'),
  
  body('plankTime')
    .optional()
    .isInt({ min: 0, max: 3600 })
    .withMessage('Время планки должно быть от 0 до 3600 секунд'),
  
  body('punchesPerMinute')
    .optional()
    .isInt({ min: 0, max: 500 })
    .withMessage('Удары в минуту должны быть от 0 до 500'),
  
  // Валидация субъективных оценок (1-10)
  ...['energy', 'stress', 'sleep', 'nutrition', 'emotions', 'intimacy'].map(field =>
    body(field)
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage(`${field} должно быть от 1 до 10`)
  ),
  
  body('pointBGoal')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Описание цели не должно превышать 1000 символов'),
  
  handleValidationErrors
];

// Валидация для комментария тренера
const validateTrainerComment = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('ID пользователя должно быть положительным числом'),
  
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Комментарий должен содержать от 1 до 1000 символов'),
  
  body('trainingType')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Тип тренировки не должен превышать 100 символов'),
  
  handleValidationErrors
];

// Валидация для обновления профиля
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Имя должно содержать от 2 до 100 символов'),
  
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Введите корректный номер телефона'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Название компании не должно превышать 200 символов'),
  
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Сфера деятельности не должна превышать 100 символов'),
  
  body('expertiseOffer')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Предложения экспертизы не должны превышать 500 символов'),
  
  body('expertiseSeeking')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Поиск экспертизы не должен превышать 500 символов'),
  
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validatePointAForm,
  validateTrainerComment,
  validateProfileUpdate,
  handleValidationErrors
};
