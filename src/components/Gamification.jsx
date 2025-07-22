import { useState, useEffect } from 'react'
import { Trophy, Star, Target, Zap, Award, Crown } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'

/**
 * Компонент для gamification элементов
 * Включает celebrations, streak counter, achievement badges
 */

// Компонент для celebration анимации
export const Celebration = ({ show, type = 'success', onComplete }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      hapticFeedback.success()
      
      // Автоматически скрываем через 3 секунды
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  const celebrations = {
    success: {
      emoji: '🎉',
      title: 'Поздравляем!',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    level: {
      emoji: '⬆️',
      title: 'Новый уровень!',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    streak: {
      emoji: '🔥',
      title: 'Серия продолжается!',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    },
    achievement: {
      emoji: '🏆',
      title: 'Достижение разблокировано!',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    }
  }

  const celebration = celebrations[type] || celebrations.success

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={`
        ${celebration.bg} ${celebration.border} ${celebration.color}
        border-2 rounded-xl p-6 max-w-sm mx-4
        bounce-animation success-animation
        pointer-events-auto
      `}>
        <div className="text-center">
          <div className="text-4xl mb-2 pulse-animation">{celebration.emoji}</div>
          <h3 className="text-lg font-bold mb-2">{celebration.title}</h3>
          <p className="text-sm opacity-80">Продолжайте в том же духе! 💪</p>
        </div>
      </div>
    </div>
  )
}

// Компонент для streak counter
export const StreakCounter = ({ streak, lastActivity }) => {
  const getStreakStatus = () => {
    if (!lastActivity) return 'inactive'
    
    const now = new Date()
    const last = new Date(lastActivity)
    const hoursSinceActivity = (now - last) / (1000 * 60 * 60)
    
    if (hoursSinceActivity < 24) return 'active'
    if (hoursSinceActivity < 48) return 'warning'
    return 'broken'
  }

  const status = getStreakStatus()

  const statusStyles = {
    active: {
      icon: '🔥',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'Серия активна'
    },
    warning: {
      icon: '⚠️',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'Серия под угрозой'
    },
    broken: {
      icon: '💔',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'Серия прервана'
    },
    inactive: {
      icon: '🌟',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'Начните серию'
    }
  }

  const style = statusStyles[status]

  return (
    <div className={`
      ${style.bg} ${style.border} ${style.color}
      border rounded-lg p-3 fade-in
    `}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{style.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="font-medium text-sm">Серия тренировок</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-lg font-bold">{streak}</span>
            <span className="text-xs opacity-80">дней</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80">{style.text}</div>
        </div>
      </div>
    </div>
  )
}

// Компонент для achievement badges
export const AchievementBadge = ({ achievement, earned = false, progress = 0 }) => {
  const [showDetails, setShowDetails] = useState(false)

  const handleClick = () => {
    if (earned) {
      hapticFeedback.success()
    } else {
      hapticFeedback.selection()
    }
    setShowDetails(!showDetails)
  }

  const achievementTypes = {
    training: { icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    streak: { icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
    level: { icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50' },
    special: { icon: Award, color: 'text-green-600', bg: 'bg-green-50' }
  }

  const type = achievementTypes[achievement.type] || achievementTypes.training
  const IconComponent = type.icon

  return (
    <div 
      className={`
        border rounded-lg p-3 cursor-pointer transition-all duration-200
        ${earned 
          ? `${type.bg} border-current ${type.color} card-animation` 
          : 'bg-gray-50 border-gray-200 text-gray-400'
        }
        ${showDetails ? 'ring-2 ring-current ring-opacity-20' : ''}
        interactive-hover
      `}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${earned ? type.bg : 'bg-gray-100'}
        `}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{achievement.title}</h4>
          {earned ? (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs">Получено</span>
            </div>
          ) : (
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-current transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs">{progress}%</span>
              </div>
            </div>
          )}
        </div>
        {earned && (
          <Trophy className="w-4 h-4 text-yellow-500 pulse-animation" />
        )}
      </div>
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-xs opacity-80 leading-relaxed">
            {achievement.description}
          </p>
          {achievement.reward && (
            <div className="mt-2 text-xs font-medium">
              🎁 Награда: {achievement.reward}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Компонент для анимированного прогресс-бара
export const AnimatedProgressBar = ({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true,
  color = 'orange',
  size = 'md'
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  const percentage = Math.round((animatedValue / max) * 100)

  const colorClasses = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  }

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{label}</span>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`
        w-full bg-gray-200 rounded-full overflow-hidden
        ${sizeClasses[size]}
      `}>
        <div 
          className={`
            h-full ${colorClasses[color]} 
            transition-all duration-800 ease-out
            progress-fill
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Компонент для level indicator
export const LevelIndicator = ({ 
  currentLevel, 
  currentExp, 
  expToNext,
  animate = true 
}) => {
  return (
    <div className={`
      bg-gradient-to-r from-purple-50 to-blue-50 
      border-2 border-purple-200 rounded-xl p-4
      ${animate ? 'card-animation' : ''}
    `}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-800">Уровень</span>
        </div>
        <div className="text-2xl font-bold text-purple-600">
          {currentLevel}
        </div>
      </div>
      
      <AnimatedProgressBar
        value={currentExp}
        max={expToNext}
        label="До следующего уровня"
        color="purple"
        size="md"
      />
    </div>
  )
}

export default {
  Celebration,
  StreakCounter,
  AchievementBadge,
  AnimatedProgressBar,
  LevelIndicator
}