import { createContext, useContext, useReducer, useEffect } from 'react'
import { AuthAPI, TokenService } from '../services/apiService'

// Состояния аутентификации
const AuthStates = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
}

// Действия для reducer
const AuthActions = {
  INIT_START: 'INIT_START',
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Начальное состояние
const initialState = {
  status: AuthStates.IDLE,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}

// Reducer для управления состоянием аутентификации
function authReducer(state, action) {
  switch (action.type) {
    case AuthActions.INIT_START:
    case AuthActions.LOGIN_START:
      return {
        ...state,
        status: AuthStates.LOADING,
        isLoading: true,
        error: null
      }

    case AuthActions.LOGIN_SUCCESS:
      return {
        ...state,
        status: AuthStates.AUTHENTICATED,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }

    case AuthActions.LOGIN_FAILED:
      return {
        ...state,
        status: AuthStates.UNAUTHENTICATED,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      }

    case AuthActions.LOGOUT:
      return {
        ...state,
        status: AuthStates.UNAUTHENTICATED,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }

    case AuthActions.SET_ERROR:
      return {
        ...state,
        status: AuthStates.ERROR,
        isLoading: false,
        error: action.payload.error
      }

    case AuthActions.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Создаем Context
const AuthContext = createContext(null)

// Auth Provider компонент
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Инициализация - проверяем сохраненный токен при загрузке
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: AuthActions.INIT_START })
      
      const token = TokenService.getToken()
      
      if (!token || TokenService.isTokenExpired(token)) {
        dispatch({ type: AuthActions.LOGOUT })
        return
      }

      try {
        // Проверяем токен, получая профиль пользователя
        const userData = await AuthAPI.getProfile()
        
        dispatch({
          type: AuthActions.LOGIN_SUCCESS,
          payload: { user: userData.user }
        })
        
        console.log('✅ Автоматическая авторизация успешна:', userData.user.name)
      } catch (error) {
        console.warn('⚠️ Ошибка автоматической авторизации:', error.message)
        TokenService.removeToken()
        dispatch({
          type: AuthActions.LOGIN_FAILED,
          payload: { error: 'Сессия истекла' }
        })
      }
    }

    initAuth()
  }, [])

  // Функция входа
  const login = async (email, password) => {
    dispatch({ type: AuthActions.LOGIN_START })
    
    try {
      console.log('🔍 Попытка входа:', email)
      const response = await AuthAPI.login(email, password)
      
      console.log('📡 Ответ API:', response)
      
      // Проверяем, что токен сохранился
      const savedToken = TokenService.getToken()
      console.log('🔐 Токен после входа:', savedToken ? savedToken.substring(0, 50) + '...' : 'отсутствует')
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { user: response.user }
      })
      
      console.log('✅ Вход выполнен:', response.user.name)
      return { success: true, user: response.user }
      
    } catch (error) {
      console.error('❌ Ошибка входа:', error.message)
      
      dispatch({
        type: AuthActions.LOGIN_FAILED,
        payload: { error: error.message }
      })
      
      return { success: false, error: error.message }
    }
  }

  // Функция регистрации
  const register = async (userData) => {
    dispatch({ type: AuthActions.LOGIN_START })
    
    try {
      console.log('🔍 Данные для регистрации:', userData)
      const response = await AuthAPI.register(userData)
      
      dispatch({
        type: AuthActions.LOGIN_SUCCESS,
        payload: { user: response.user }
      })
      
      console.log('✅ Регистрация выполнена:', response.user.name)
      return { success: true, user: response.user }
      
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error)
      
      // Обработка детальных ошибок валидации
      let errorMessage = error.message
      if (error.response && error.response.details) {
        const validationErrors = error.response.details.map(detail => 
          `${detail.field}: ${detail.message}`
        ).join(', ')
        errorMessage = `Ошибки валидации: ${validationErrors}`
      }
      
      dispatch({
        type: AuthActions.LOGIN_FAILED,
        payload: { error: errorMessage }
      })
      
      return { success: false, error: errorMessage }
    }
  }

  // Функция выхода
  const logout = () => {
    AuthAPI.logout() // Удаляет токен из localStorage
    dispatch({ type: AuthActions.LOGOUT })
    console.log('👋 Выход из системы')
  }

  // Обновление профиля пользователя
  const updateUser = (updatedUser) => {
    dispatch({
      type: AuthActions.LOGIN_SUCCESS,
      payload: { user: { ...state.user, ...updatedUser } }
    })
  }

  // Очистка ошибок
  const clearError = () => {
    dispatch({ type: AuthActions.CLEAR_ERROR })
  }

  // Проверка роли пользователя
  const hasRole = (role) => {
    return state.user?.role === role
  }

  // Проверка разрешений
  const isClient = () => hasRole('client')
  const isCoach = () => hasRole('coach')
  const isAdmin = () => hasRole('admin')

  const value = {
    // Состояние
    ...state,
    
    // Методы
    login,
    register,
    logout,
    updateUser,
    clearError,
    
    // Утилиты
    hasRole,
    isClient,
    isCoach,
    isAdmin,
    
    // Статусы для удобства
    isInitializing: state.status === AuthStates.LOADING && !state.isAuthenticated,
    hasError: state.status === AuthStates.ERROR,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook для использования Auth Context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  
  return context
}

// Экспорт состояний для использования в компонентах
export { AuthStates }

console.log('🔐 Auth Context инициализирован')
