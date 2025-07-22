/**
 * Утилиты для интеграции с Telegram WebApp
 * Поддерживает Telegram WebApp API и адаптацию интерфейса
 */

// Проверка, что мы запущены в Telegram WebApp
export const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && 
         window.Telegram?.WebApp && 
         window.Telegram.WebApp.initData !== ''
}

// Получение информации о пользователе Telegram
export const getTelegramUser = () => {
  if (!isTelegramWebApp()) return null
  
  try {
    const webApp = window.Telegram.WebApp
    return {
      id: webApp.initDataUnsafe?.user?.id,
      firstName: webApp.initDataUnsafe?.user?.first_name,
      lastName: webApp.initDataUnsafe?.user?.last_name,
      username: webApp.initDataUnsafe?.user?.username,
      languageCode: webApp.initDataUnsafe?.user?.language_code,
      isPremium: webApp.initDataUnsafe?.user?.is_premium,
      photoUrl: webApp.initDataUnsafe?.user?.photo_url
    }
  } catch (error) {
    console.warn('Ошибка получения данных пользователя Telegram:', error)
    return null
  }
}

// Получение темы Telegram
export const getTelegramTheme = () => {
  if (!isTelegramWebApp()) return null
  
  try {
    const webApp = window.Telegram.WebApp
    return {
      colorScheme: webApp.colorScheme, // 'light' or 'dark'
      themeParams: webApp.themeParams,
      backgroundColor: webApp.backgroundColor,
      headerColor: webApp.headerColor
    }
  } catch (error) {
    console.warn('Ошибка получения темы Telegram:', error)
    return null
  }
}

// Инициализация Telegram WebApp
export const initializeTelegramWebApp = () => {
  if (!isTelegramWebApp()) return false
  
  try {
    const webApp = window.Telegram.WebApp
    
    // Настройка WebApp
    webApp.ready() // Уведомляем Telegram что WebApp готов
    webApp.expand() // Расширяем WebApp на весь экран
    webApp.enableClosingConfirmation() // Включаем подтверждение закрытия
    
    // Настройка главной кнопки
    webApp.MainButton.setText('Готово')
    webApp.MainButton.color = '#FF6B35' // Цвет бренда
    webApp.MainButton.textColor = '#FFFFFF'
    
    // Настройка кнопки "Назад"
    webApp.BackButton.onClick(() => {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        webApp.close()
      }
    })
    
    // Применяем цветовую схему Telegram
    applyTelegramTheme()
    
    console.log('✅ Telegram WebApp инициализирован')
    return true
  } catch (error) {
    console.warn('❌ Ошибка инициализации Telegram WebApp:', error)
    return false
  }
}

// Применение цветовой схемы Telegram
export const applyTelegramTheme = () => {
  if (!isTelegramWebApp()) return
  
  try {
    const theme = getTelegramTheme()
    if (!theme) return
    
    const root = document.documentElement
    
    // Применяем цвета темы Telegram
    if (theme.themeParams) {
      const params = theme.themeParams
      
      // Основные цвета
      if (params.bg_color) {
        root.style.setProperty('--telegram-bg', params.bg_color)
        root.style.setProperty('--background', params.bg_color)
      }
      
      if (params.text_color) {
        root.style.setProperty('--telegram-text', params.text_color)
        root.style.setProperty('--foreground', params.text_color)
      }
      
      if (params.hint_color) {
        root.style.setProperty('--telegram-hint', params.hint_color)
        root.style.setProperty('--muted-foreground', params.hint_color)
      }
      
      if (params.button_color) {
        root.style.setProperty('--telegram-button', params.button_color)
        root.style.setProperty('--primary', params.button_color)
      }
      
      if (params.button_text_color) {
        root.style.setProperty('--telegram-button-text', params.button_text_color)
        root.style.setProperty('--primary-foreground', params.button_text_color)
      }
    }
    
    // Добавляем класс для темной темы
    if (theme.colorScheme === 'dark') {
      document.body.classList.add('telegram-dark')
    } else {
      document.body.classList.remove('telegram-dark')
    }
    
    console.log('🎨 Применена цветовая схема Telegram:', theme.colorScheme)
  } catch (error) {
    console.warn('Ошибка применения темы Telegram:', error)
  }
}

// Управление главной кнопкой
export const telegramMainButton = {
  show: (text = 'Готово', onClick = null) => {
    if (!isTelegramWebApp()) return
    
    const webApp = window.Telegram.WebApp
    webApp.MainButton.setText(text)
    webApp.MainButton.show()
    
    if (onClick) {
      webApp.MainButton.onClick(onClick)
    }
  },
  
  hide: () => {
    if (!isTelegramWebApp()) return
    window.Telegram.WebApp.MainButton.hide()
  },
  
  enable: () => {
    if (!isTelegramWebApp()) return
    window.Telegram.WebApp.MainButton.enable()
  },
  
  disable: () => {
    if (!isTelegramWebApp()) return
    window.Telegram.WebApp.MainButton.disable()
  },
  
  showProgress: () => {
    if (!isTelegramWebApp()) return
    window.Telegram.WebApp.MainButton.showProgress()
  },
  
  hideProgress: () => {
    if (!isTelegramWebApp()) return
    window.Telegram.WebApp.MainButton.hideProgress()
  }
}

// Управление кнопкой "Назад"
export const telegramBackButton = {
  show: () => {
    if (!isTelegramWebApp()) return
    window.Telegram.WebApp.BackButton.show()
  },
  
  hide: () => {
    if (!isTelegramWebApp()) return
    window.Telegram.WebApp.BackButton.hide()
  }
}

// Уведомления Telegram
export const telegramNotifications = {
  // Показать всплывающее уведомление
  showAlert: (message) => {
    if (!isTelegramWebApp()) {
      alert(message)
      return
    }
    
    window.Telegram.WebApp.showAlert(message)
  },
  
  // Показать подтверждение
  showConfirm: (message, callback) => {
    if (!isTelegramWebApp()) {
      const result = confirm(message)
      if (callback) callback(result)
      return
    }
    
    window.Telegram.WebApp.showConfirm(message, callback)
  },
  
  // Показать всплывающее окно
  showPopup: (params) => {
    if (!isTelegramWebApp()) {
      alert(params.message)
      return
    }
    
    window.Telegram.WebApp.showPopup({
      title: params.title,
      message: params.message,
      buttons: params.buttons || [{ type: 'ok' }]
    }, params.callback)
  }
}

// Утилиты для работы с данными
export const telegramData = {
  // Отправить данные в Telegram
  sendData: (data) => {
    if (!isTelegramWebApp()) return
    
    try {
      const webApp = window.Telegram.WebApp
      webApp.sendData(JSON.stringify(data))
    } catch (error) {
      console.warn('Ошибка отправки данных в Telegram:', error)
    }
  },
  
  // Закрыть WebApp
  close: () => {
    if (!isTelegramWebApp()) return
    window.Telegram.WebApp.close()
  },
  
  // Открыть ссылку
  openLink: (url) => {
    if (!isTelegramWebApp()) {
      window.open(url, '_blank')
      return
    }
    
    window.Telegram.WebApp.openLink(url)
  },
  
  // Открыть Telegram ссылку
  openTelegramLink: (url) => {
    if (!isTelegramWebApp()) {
      window.open(url, '_blank')
      return
    }
    
    window.Telegram.WebApp.openTelegramLink(url)
  }
}

// Хук для использования в React компонентах
export const useTelegram = () => {
  const isWebApp = isTelegramWebApp()
  const user = getTelegramUser()
  const theme = getTelegramTheme()
  
  return {
    isWebApp,
    user,
    theme,
    mainButton: telegramMainButton,
    backButton: telegramBackButton,
    notifications: telegramNotifications,
    data: telegramData,
    initialize: initializeTelegramWebApp
  }
}

export default {
  isTelegramWebApp,
  getTelegramUser,
  getTelegramTheme,
  initializeTelegramWebApp,
  applyTelegramTheme,
  telegramMainButton,
  telegramBackButton,
  telegramNotifications,
  telegramData,
  useTelegram
}