/**
 * Утилиты для haptic feedback на мобильных устройствах
 * Поддерживает Web Vibration API и Telegram WebApp haptic
 */

// Проверка поддержки вибрации
const isVibrationSupported = () => {
  return 'vibrate' in navigator
}

// Проверка Telegram WebApp
const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && window.Telegram?.WebApp
}

// Типы haptic feedback
export const HapticType = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SELECTION: 'selection'
}

// Паттерны вибрации для разных типов
const vibrationPatterns = {
  [HapticType.LIGHT]: [10],
  [HapticType.MEDIUM]: [30],
  [HapticType.HEAVY]: [50],
  [HapticType.SUCCESS]: [10, 50, 10],
  [HapticType.WARNING]: [30, 20, 30],
  [HapticType.ERROR]: [50, 100, 50],
  [HapticType.SELECTION]: [5]
}

/**
 * Воспроизводит haptic feedback
 * @param {string} type - Тип haptic feedback из HapticType
 * @param {boolean} fallback - Использовать fallback для Web Vibration API
 */
export const triggerHaptic = (type = HapticType.LIGHT, fallback = true) => {
  try {
    // Приоритет: Telegram WebApp Haptic
    if (isTelegramWebApp()) {
      const telegram = window.Telegram.WebApp
      
      switch (type) {
        case HapticType.LIGHT:
        case HapticType.SELECTION:
          telegram.HapticFeedback?.selectionChanged()
          break
        case HapticType.MEDIUM:
          telegram.HapticFeedback?.impactOccurred('medium')
          break
        case HapticType.HEAVY:
          telegram.HapticFeedback?.impactOccurred('heavy')
          break
        case HapticType.SUCCESS:
          telegram.HapticFeedback?.notificationOccurred('success')
          break
        case HapticType.WARNING:
          telegram.HapticFeedback?.notificationOccurred('warning')
          break
        case HapticType.ERROR:
          telegram.HapticFeedback?.notificationOccurred('error')
          break
        default:
          telegram.HapticFeedback?.selectionChanged()
      }
      return true
    }

    // Fallback: Web Vibration API
    if (fallback && isVibrationSupported()) {
      const pattern = vibrationPatterns[type] || vibrationPatterns[HapticType.LIGHT]
      navigator.vibrate(pattern)
      return true
    }

    return false
  } catch (error) {
    console.warn('Haptic feedback error:', error)
    return false
  }
}

/**
 * Хуки для разных типов действий
 */
export const hapticFeedback = {
  // Нажатие на кнопку
  buttonPress: () => triggerHaptic(HapticType.LIGHT),
  
  // Успешное действие
  success: () => triggerHaptic(HapticType.SUCCESS),
  
  // Ошибка
  error: () => triggerHaptic(HapticType.ERROR),
  
  // Предупреждение
  warning: () => triggerHaptic(HapticType.WARNING),
  
  // Выбор элемента
  selection: () => triggerHaptic(HapticType.SELECTION),
  
  // Свайп/навигация
  swipe: () => triggerHaptic(HapticType.MEDIUM),
  
  // Pull-to-refresh
  refresh: () => triggerHaptic(HapticType.MEDIUM),
  
  // Долгое нажатие
  longPress: () => triggerHaptic(HapticType.HEAVY)
}

/**
 * Утилита для добавления haptic feedback к обработчику события
 * @param {Function} onClick - Обработчик клика
 * @param {string} hapticType - Тип haptic feedback
 */
export const withHapticClick = (onClick, hapticType = HapticType.LIGHT) => {
  return (e) => {
    triggerHaptic(hapticType)
    if (onClick) {
      onClick(e)
    }
  }
}

export default hapticFeedback