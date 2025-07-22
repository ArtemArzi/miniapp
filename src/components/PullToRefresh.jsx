import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'

/**
 * Компонент Pull-to-Refresh для мобильных устройств
 * Поддерживает native iOS/Android pull-to-refresh и fallback для web
 */
const PullToRefresh = ({ onRefresh, children, disabled = false }) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const containerRef = useRef(null)
  const lastTouchY = useRef(0)

  // Константы для pull-to-refresh
  const PULL_THRESHOLD = 80 // Минимальное расстояние для trigger
  const MAX_PULL_DISTANCE = 120 // Максимальное расстояние pull
  const REFRESH_THRESHOLD = 60 // Точка срабатывания refresh

  // Проверка, находимся ли мы в самом верху страницы
  const isAtTop = () => {
    const container = containerRef.current
    if (!container) return false
    return container.scrollTop === 0
  }

  // Обработчики touch событий
  const handleTouchStart = (e) => {
    if (disabled || isRefreshing) return
    
    const touch = e.touches[0]
    setTouchStart(touch.clientY)
    lastTouchY.current = touch.clientY
  }

  const handleTouchMove = (e) => {
    if (disabled || isRefreshing || !touchStart) return
    
    const touch = e.touches[0]
    const currentY = touch.clientY
    const deltaY = currentY - lastTouchY.current
    
    // Проверяем, что пользователь тянет вниз и находится в верхней части
    if (deltaY > 0 && isAtTop()) {
      e.preventDefault() // Предотвращаем стандартное поведение скролла
      
      const pullDist = Math.min(currentY - touchStart, MAX_PULL_DISTANCE)
      
      if (pullDist > 0) {
        setIsPulling(true)
        setPullDistance(pullDist)
      }
    }
    
    lastTouchY.current = currentY
  }

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) return
    
    if (isPulling && pullDistance > REFRESH_THRESHOLD) {
      setIsRefreshing(true)
      hapticFeedback.refresh()
      try {
        await onRefresh?.()
        hapticFeedback.success()
      } catch (error) {
        console.error('Ошибка при обновлении:', error)
        hapticFeedback.error()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    // Сбрасываем состояние
    setIsPulling(false)
    setPullDistance(0)
    setTouchStart(0)
  }

  // Расчет стилей для анимации
  const getTransformStyle = () => {
    if (isPulling || isRefreshing) {
      const distance = isRefreshing ? REFRESH_THRESHOLD : pullDistance
      return {
        transform: `translateY(${distance}px)`,
        transition: isRefreshing ? 'transform 0.2s ease-out' : 'none'
      }
    }
    return {
      transform: 'translateY(0)',
      transition: 'transform 0.2s ease-out'
    }
  }

  // Стили для индикатора
  const getIndicatorOpacity = () => {
    if (isRefreshing) return 1
    if (isPulling) return Math.min(pullDistance / REFRESH_THRESHOLD, 1)
    return 0
  }

  const getIndicatorRotation = () => {
    if (isRefreshing) return 'animate-spin'
    if (isPulling) return `rotate-${Math.min(Math.floor(pullDistance / 10) * 45, 180)}`
    return ''
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Индикатор Pull-to-Refresh */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? REFRESH_THRESHOLD : 0)}px`,
          opacity: getIndicatorOpacity(),
          transition: isRefreshing ? 'opacity 0.2s ease-out' : 'none'
        }}
      >
        <div className="flex items-center gap-2 text-primary">
          <RefreshCw 
            className={`w-5 h-5 ${getIndicatorRotation()}`}
            style={{
              transition: isRefreshing ? 'none' : 'transform 0.1s ease-out'
            }}
          />
          <span className="text-sm font-medium">
            {isRefreshing 
              ? 'Обновление...' 
              : pullDistance > REFRESH_THRESHOLD 
                ? 'Отпустите для обновления' 
                : 'Потяните для обновления'
            }
          </span>
        </div>
      </div>

      {/* Основной контент */}
      <div 
        className="h-full overflow-y-auto"
        style={getTransformStyle()}
      >
        {children}
      </div>
    </div>
  )
}

export default PullToRefresh