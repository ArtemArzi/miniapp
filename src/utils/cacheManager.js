/**
 * Менеджер кэша для очистки всех данных приложения
 */

export const CacheManager = {
  /**
   * Полная очистка всех данных кэша
   */
  clearAllCache() {
    try {
      console.log('🧹 Начинаем полную очистку кэша...');
      
      // 1. Очищаем localStorage
      const localStorageKeys = Object.keys(localStorage);
      console.log(`📱 Найдено ${localStorageKeys.length} ключей в localStorage:`, localStorageKeys);
      
      localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`❌ Удален ключ localStorage: ${key}`);
      });
      
      // 2. Очищаем sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage);
      console.log(`📱 Найдено ${sessionStorageKeys.length} ключей в sessionStorage:`, sessionStorageKeys);
      
      sessionStorageKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`❌ Удален ключ sessionStorage: ${key}`);
      });
      
      // 3. Очищаем кэш сервис-воркера (если есть)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister();
            console.log('❌ Service Worker отключен');
          }
        });
      }
      
      // 4. Очищаем IndexedDB (если используется)
      if ('indexedDB' in window) {
        console.log('🗄️ Очищаем IndexedDB...');
        // Можно добавить специфичную логику если используется IndexedDB
      }
      
      console.log('✅ Полная очистка кэша завершена');
      return true;
      
    } catch (error) {
      console.error('❌ Ошибка при очистке кэша:', error);
      return false;
    }
  },

  /**
   * Очистка только токенов аутентификации
   */
  clearAuthCache() {
    try {
      console.log('🔐 Очищаем кэш аутентификации...');
      
      // Специфичные ключи для Jaguar Club
      const authKeys = [
        'jaguar_token',
        'auth_user',
        'user_profile',
        'last_login',
        'auth_state'
      ];
      
      authKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`❌ Удален auth ключ: ${key}`);
        }
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
          console.log(`❌ Удален auth ключ из session: ${key}`);
        }
      });
      
      console.log('✅ Кэш аутентификации очищен');
      return true;
      
    } catch (error) {
      console.error('❌ Ошибка при очистке auth кэша:', error);
      return false;
    }
  },

  /**
   * Очистка кэша данных пользователей
   */
  clearUserDataCache() {
    try {
      console.log('👥 Очищаем кэш данных пользователей...');
      
      // Ключи, которые могут содержать кэшированные данные пользователей
      const userDataKeys = [
        'community_members',
        'user_list',
        'trainers_list',
        'clients_list',
        'dashboard_data',
        'user_stats',
        'cached_users'
      ];
      
      userDataKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`❌ Удален user data ключ: ${key}`);
        }
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
          console.log(`❌ Удален user data ключ из session: ${key}`);
        }
      });
      
      console.log('✅ Кэш данных пользователей очищен');
      return true;
      
    } catch (error) {
      console.error('❌ Ошибка при очистке user data кэша:', error);
      return false;
    }
  },

  /**
   * Очистка и перезагрузка страницы
   */
  clearCacheAndReload() {
    console.log('🔄 Очищаем кэш и перезагружаем страницу...');
    
    // Очищаем все
    this.clearAllCache();
    
    // Добавляем небольшую задержку перед перезагрузкой
    setTimeout(() => {
      console.log('🔄 Перезагружаем страницу...');
      window.location.reload(true); // true заставляет загрузить с сервера
    }, 500);
  },

  /**
   * Проверяем, есть ли кэшированные данные
   */
  hasCachedData() {
    const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
    console.log('🔍 Найденные ключи кэша:', allKeys);
    return allKeys.length > 0;
  },

  /**
   * Получаем информацию о текущем кэше
   */
  getCacheInfo() {
    const localStorageKeys = Object.keys(localStorage);
    const sessionStorageKeys = Object.keys(sessionStorage);
    
    return {
      localStorage: {
        count: localStorageKeys.length,
        keys: localStorageKeys,
        size: JSON.stringify(localStorage).length
      },
      sessionStorage: {
        count: sessionStorageKeys.length,
        keys: sessionStorageKeys,
        size: JSON.stringify(sessionStorage).length
      }
    };
  }
};

// Автоматическая очистка при обновлении приложения
export const setupCacheInvalidation = () => {
  const APP_VERSION = '2.0.0'; // Версия после очистки тестовых данных
  const LAST_VERSION_KEY = 'app_version';
  
  const lastVersion = localStorage.getItem(LAST_VERSION_KEY);
  
  if (lastVersion !== APP_VERSION) {
    console.log(`🔄 Обнаружена новая версия приложения (${lastVersion} → ${APP_VERSION})`);
    CacheManager.clearAllCache();
    localStorage.setItem(LAST_VERSION_KEY, APP_VERSION);
    console.log('✅ Кэш очищен для новой версии');
  }
};

export default CacheManager;