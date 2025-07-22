// Централизованная система логирования для Jaguar Fight Club
// Управляет логами и предотвращает избыточный вывод в продакшене

const isDevelopment = import.meta.env.MODE === 'development';

// Уровни логирования
const LogLevel = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug'
};

// Цвета для консоли
const LogColors = {
  [LogLevel.ERROR]: 'color: #ff4444; font-weight: bold;',
  [LogLevel.WARN]: 'color: #ffaa00; font-weight: bold;',
  [LogLevel.INFO]: 'color: #4444ff;',
  [LogLevel.DEBUG]: 'color: #888888;'
};

// Основная функция логирования
function log(level, message, context = null, error = null) {
  // В продакшене показываем только критические ошибки
  if (!isDevelopment && level !== LogLevel.ERROR) {
    return;
  }

  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
  
  if (isDevelopment) {
    // В разработке - красивый вывод с цветами
    console.log(`%c${prefix} ${message}`, LogColors[level]);
    
    if (context) {
      console.log(`%cКонтекст:`, 'color: #666;', context);
    }
    
    if (error) {
      console.log(`%cОшибка:`, 'color: #ff4444;', error);
    }
  } else {
    // В продакшене - простой вывод только для ошибок
    if (level === LogLevel.ERROR) {
      console.error(prefix, message);
      if (error) console.error('Детали:', error);
    }
  }
}

// Экспортируемые методы
export const logger = {
  // Критические ошибки (всегда показываются)
  error(message, context = null, error = null) {
    log(LogLevel.ERROR, message, context, error);
    
    // В продакшене можно отправлять в систему мониторинга
    if (!isDevelopment) {
      // TODO: Интеграция с системой мониторинга (Sentry, LogRocket)
    }
  },

  // Предупреждения (только в разработке)
  warn(message, context = null) {
    log(LogLevel.WARN, message, context);
  },

  // Информационные сообщения (только в разработке)
  info(message, context = null) {
    log(LogLevel.INFO, message, context);
  },

  // Отладочная информация (только в разработке)
  debug(message, context = null) {
    log(LogLevel.DEBUG, message, context);
  },

  // Логирование API запросов
  api: {
    request(method, url, data = null) {
      logger.debug(`API ${method} ${url}`, data);
    },
    
    success(method, url, data = null) {
      logger.info(`✅ API ${method} ${url} - успешно`, data);
    },
    
    error(method, url, error) {
      logger.error(`❌ API ${method} ${url} - ошибка`, { url, method }, error);
    }
  },

  // Логирование пользовательских действий
  user: {
    action(action, details = null) {
      logger.info(`👤 Пользователь: ${action}`, details);
    },
    
    error(action, error) {
      logger.error(`👤 Ошибка пользователя: ${action}`, null, error);
    }
  },

  // Логирование компонентов
  component: {
    mount(name) {
      logger.debug(`🎨 Компонент смонтирован: ${name}`);
    },
    
    unmount(name) {
      logger.debug(`🎨 Компонент размонтирован: ${name}`);
    },
    
    error(name, error) {
      logger.error(`🎨 Ошибка компонента: ${name}`, null, error);
    }
  }
};

// Утилиты для форматирования
export const formatters = {
  // Форматирование времени
  duration(ms) {
    if (ms < 1000) return `${ms}мс`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}с`;
    return `${(ms / 60000).toFixed(1)}мин`;
  },

  // Форматирование размера данных
  bytes(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  },

  // Безопасное форматирование объектов
  object(obj, maxDepth = 2) {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return '[Циклическая ссылка]';
    }
  }
};

export default logger;