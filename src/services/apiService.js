// API Service для JAGUAR FIGHT CLUB
// Централизованный сервис для всех API вызовов

import { logger } from '../utils/logger.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Базовый класс для API ошибок
class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// Утилита для работы с токенами
const TokenService = {
  getToken() {
    const token = localStorage.getItem('jaguar_token');
    logger.debug('Получение токена из localStorage', { hasToken: !!token });
    return token;
  },
  
  setToken(token) {
    logger.debug('Сохранение токена в localStorage');
    localStorage.setItem('jaguar_token', token);
    
    // Проверяем что токен действительно сохранился
    const savedToken = localStorage.getItem('jaguar_token');
    if (savedToken !== token) {
      logger.error('Критическая ошибка: токен не сохранился в localStorage');
    }
  },
  
  removeToken() {
    logger.debug('Удаление токена из localStorage');
    localStorage.removeItem('jaguar_token');
  },
  
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      logger.debug('Проверка срока действия токена', { isExpired });
      return isExpired;
    } catch (error) {
      logger.error('Ошибка при проверке срока действия токена', null, error);
      return true;
    }
  }
};

// Базовая функция для HTTP запросов
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = TokenService.getToken();
  
  // Проверяем токен на валидность
  if (token && TokenService.isTokenExpired(token)) {
    TokenService.removeToken();
    throw new ApiError('Токен истёк, требуется повторная авторизация', 401);
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  // Добавляем токен если есть
  if (token && !TokenService.isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Создаем AbortController для timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 секунд для медленных операций
  config.signal = controller.signal;
  
  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    // Проверяем статус ответа
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }
    
    // Возвращаем JSON если есть контент
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Обработка прерывания по таймауту
    if (error.name === 'AbortError') {
      throw new ApiError('Превышено время ожидания ответа сервера (30 сек)', 408);
    }
    
    // Обработка сетевых ошибок
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError('Ошибка сети. Проверьте подключение к интернету или работу сервера.', 0);
    }
    
    throw new ApiError(error.message || 'Неизвестная ошибка', 0);
  }
}

// API для аутентификации
export const AuthAPI = {
  // Вход в систему
  async login(email, password) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Сохраняем токен
    if (response.token) {
      TokenService.setToken(response.token);
      logger.info('Токен сохранен в localStorage');
      
      // Проверяем сохранение
      const savedToken = TokenService.getToken();
      if (savedToken === response.token) {
        logger.info('Токен успешно сохранен и проверен');
      } else {
        logger.error('Токен не сохранился корректно');
      }
    } else {
      logger.warn('Токен не найден в ответе сервера');
    }
    
    return response;
  },
  
  // Регистрация
  async register(userData) {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Сохраняем токен
    if (response.token) {
      TokenService.setToken(response.token);
    }
    
    return response;
  },
  
  // Получение профиля
  async getProfile() {
    return await apiRequest('/auth/profile');
  },
  
  // Выход из системы
  logout() {
    TokenService.removeToken();
  }
};

// API для анкет "Точка А"
export const PointAAPI = {
  // Сохранение анкеты
  async saveForm(formData) {
    return await apiRequest('/point-a', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
  
  // Получение своей анкеты
  async getForm() {
    return await apiRequest('/point-a');
  },
  
  // Получение анкеты конкретного пользователя (для тренеров)
  async getFormByUserId(userId) {
    return await apiRequest(`/point-a/${userId}`);
  }
};

// API для комментариев
export const CommentsAPI = {
  // Добавление комментария (тренер)
  async addComment(commentData) {
    return await apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },
  
  // Получение комментариев
  async getComments(params = {}) {
    const searchParams = new URLSearchParams(params);
    return await apiRequest(`/comments?${searchParams}`);
  },

  // Получение комментариев пользователя по ID
  async getCommentsByUserId(userId, params = {}) {
    const searchParams = new URLSearchParams(params);
    return await apiRequest(`/comments/${userId}?${searchParams}`);
  },
  
  // Количество непрочитанных комментариев
  async getUnreadCount() {
    return await apiRequest('/comments/unread/count');
  },
  
  // Отметка комментария как прочитанного
  async markAsRead(commentId) {
    return await apiRequest(`/comments/${commentId}/read`, {
      method: 'PUT',
    });
  }
};

// API для пользователей
export const UsersAPI = {
  // Список пользователей (для тренеров)
  async getUsers(role = null) {
    const params = role ? `?role=${role}` : '';
    return await apiRequest(`/users${params}`);
  },
  
  // Информация о конкретном пользователе
  async getUserById(userId) {
    return await apiRequest(`/users/${userId}`);
  },
  
  // Статистика пользователя
  async getUserStats(userId) {
    return await apiRequest(`/users/${userId}/stats`);
  },
  
  // Обновление профиля
  async updateProfile(profileData) {
    return await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Получение профиля текущего пользователя
  async getUserProfile() {
    return await apiRequest('/auth/profile');
  },
  
  // Получение статистики текущего пользователя
  async getMyStats() {
    return await apiRequest('/users/me/stats');
  },
  
  // Получение дашборда клиента
  async getClientDashboard() {
    return await apiRequest('/users/dashboard');
  },

  // Получение участников сообщества
  async getCommunityMembers(params = {}) {
    const searchParams = new URLSearchParams(params);
    return await apiRequest(`/users/community?${searchParams}`);
  }
};

// API для тренировок
export const TrainingsAPI = {
  // Добавить тренировку (тренер)
  async addTraining(trainingData) {
    return await apiRequest('/trainings', {
      method: 'POST',
      body: JSON.stringify(trainingData),
    });
  },
  
  // Получить тренировки
  async getTrainings(params = {}) {
    const searchParams = new URLSearchParams(params);
    return await apiRequest(`/trainings?${searchParams}`);
  },
  
  // Статистика тренировок клиента
  async getTrainingStats(clientId) {
    return await apiRequest(`/trainings/stats/${clientId}`);
  },
  
  // Обновить тренировку
  async updateTraining(trainingId, trainingData) {
    return await apiRequest(`/trainings/${trainingId}`, {
      method: 'PUT',
      body: JSON.stringify(trainingData),
    });
  },
  
  // Удалить тренировку
  async deleteTraining(trainingId) {
    return await apiRequest(`/trainings/${trainingId}`, {
      method: 'DELETE',
    });
  }
};

// API для обновления прогресса
export const ProgressAPI = {
  // Обновление показателей
  async updateProgress(progressData) {
    return await apiRequest('/progress', {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  },
  
  // История прогресса
  async getProgressHistory(userId = null) {
    const params = userId ? `?userId=${userId}` : '';
    return await apiRequest(`/progress${params}`);
  }
};

// Экспорт утилит
export { TokenService, ApiError };

// Базовая функция для внешнего использования
export { apiRequest };

// Проверка состояния API
export const HealthAPI = {
  async checkHealth() {
    return await apiRequest('/test');
  },
  
  // Проверка основного API
  async checkAPI() {
    return await apiRequest('');
  }
};

logger.info('API Service инициализирован', { baseUrl: API_BASE_URL });
