import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { hapticFeedback } from '../utils/haptic'

/**
 * Компонент для swipe навигации между разделами
 * Поддерживает swipe left/right для переключения между основными разделами
 */
const SwipeNavigation = ({ children, disabled = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const containerRef = useRef(null)

  // Порядок разделов для swipe навигации
  const sections = [
    { path: '/', name: 'Главная' },
    { path: '/progress', name: 'Прогресс' },
    { path: '/community', name: 'Сообщество' },
    { path: '/profile', name: 'Профиль' }
  ]

  // Минимальное расстояние для swipe
  const MIN_SWIPE_DISTANCE = 50

  // Получаем текущий индекс раздела
  const getCurrentSectionIndex = () => {
    const currentPath = location.pathname
    return sections.findIndex(section => section.path === currentPath)
  }

  // Обработка начала touch
  const handleTouchStart = (e) => {
    if (disabled) return
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  // Обработка движения touch
  const handleTouchMove = (e) => {
    if (disabled) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  // Обработка окончания touch
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = getCurrentSectionIndex()
      let newIndex = currentIndex

      if (isLeftSwipe && currentIndex < sections.length - 1) {
        // Swipe left - следующий раздел
        newIndex = currentIndex + 1
      } else if (isRightSwipe && currentIndex > 0) {
        // Swipe right - предыдущий раздел
        newIndex = currentIndex - 1
      }

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < sections.length) {
        console.log(`🔄 Swipe navigation: ${sections[currentIndex]?.name} → ${sections[newIndex]?.name}`)
        hapticFeedback.swipe()
        navigate(sections[newIndex].path)
      }
    }
  }

  // Добавляем визуальную подсказку для swipe
  const [showSwipeHint, setShowSwipeHint] = useState(false)

  useEffect(() => {
    // Показываем подсказку для первого посещения
    const hasSeenSwipeHint = localStorage.getItem('hasSeenSwipeHint')
    if (!hasSeenSwipeHint) {
      setShowSwipeHint(true)
      setTimeout(() => {
        setShowSwipeHint(false)
        localStorage.setItem('hasSeenSwipeHint', 'true')
      }, 3000)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Визуальная подсказка для swipe */}
      {showSwipeHint && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-lg text-sm pointer-events-none">
          <div className="flex items-center gap-2">
            <span>←</span>
            <span>Свайпайте для навигации</span>
            <span>→</span>
          </div>
        </div>
      )}

      {/* Основной контент */}
      {children}
    </div>
  )
}

export default SwipeNavigation