import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupCacheInvalidation } from './utils/cacheManager.js'

// Очищаем кэш при обновлении приложения
setupCacheInvalidation();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
