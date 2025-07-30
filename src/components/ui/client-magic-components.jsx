/**
 * Enhanced Magic UI Components for Client Interface
 * Mobile-first design with Jaguar club branding
 */

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// Enhanced Stats Card with Magic UI effects
export const JaguarStatsCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  delay = 0,
  trend = 'neutral',
  className,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100)
    return () => clearTimeout(timer)
  }, [delay])

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'from-green-500/20 to-emerald-500/20 border-green-200'
      case 'down': return 'from-red-500/20 to-rose-500/20 border-red-200'
      default: return 'from-primary/20 to-amber-500/20 border-primary/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 20, 
        scale: isVisible ? 1 : 0.9 
      }}
      transition={{ 
        duration: 0.6, 
        delay: delay * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-sm",
        "p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300",
        "mobile-card touch-target group cursor-pointer",
        getTrendColor(),
        className
      )}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </h3>
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
        </div>
        
        <div className="space-y-1">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: isVisible ? 1 : 0.8 }}
            transition={{ delay: delay * 0.1 + 0.3, duration: 0.4 }}
            className="text-2xl sm:text-3xl font-bold text-foreground"
          >
            <NumberTicker value={value} />
          </motion.div>
          
          {change && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ delay: delay * 0.1 + 0.5 }}
              className="text-xs text-muted-foreground mobile-text"
            >
              {change}
            </motion.p>
          )}
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </motion.div>
  )
}

// Enhanced Number Ticker with smooth animations
export const NumberTicker = ({ 
  value, 
  duration = 1000, 
  className,
  prefix = '',
  suffix = '' 
}) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime = Date.now()
    let startValue = displayValue

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (value - startValue) * easeOutCubic
      
      setDisplayValue(Math.round(currentValue))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

// Enhanced Circular Progress Bar
export const JaguarProgressRing = ({ 
  value, 
  max = 100, 
  size = 120, 
  strokeWidth = 8,
  color = "var(--jaguar-primary)",
  backgroundColor = "var(--muted)",
  showValue = true,
  animated = true,
  className 
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / max) * circumference

  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: animated ? offset : circumference - (value / max) * circumference
          }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: "easeInOut",
            delay: 0.3
          }}
          className="drop-shadow-sm"
        />
        
        {/* Glow effect */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth / 2}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: "easeInOut",
            delay: 0.3
          }}
          className="opacity-50 blur-sm"
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-foreground">
              <NumberTicker value={Math.round(value)} suffix="%" />
            </div>
            <div className="text-xs text-muted-foreground">прогресс</div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Enhanced Magic Card with Jaguar branding
export const JaguarMagicCard = ({ 
  children, 
  className,
  gradientColor = "var(--jaguar-primary)",
  animated = true,
  glowEffect = false,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={animated ? { scale: 1.02, y: -2 } : {}}
      whileTap={animated ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        "mobile-card group",
        className
      )}
      {...props}
    >
      {/* Gradient overlay */}
      <div 
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          isHovered && "opacity-5"
        )}
        style={{
          background: `linear-gradient(135deg, ${gradientColor}20 0%, transparent 50%)`
        }}
      />

      {/* Border glow effect */}
      {glowEffect && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: isHovered
              ? `0 0 20px ${gradientColor}40`
              : `0 0 0px ${gradientColor}00`
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Shimmer effect */}
      <div className={cn(
        "absolute inset-0 -translate-x-full transition-transform duration-1000",
        isHovered && "translate-x-full",
        "bg-gradient-to-r from-transparent via-white/10 to-transparent"
      )} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
        initial={{ width: "0%" }}
        animate={{ width: isHovered ? "100%" : "0%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

// Enhanced Button Components
export const JaguarShimmerButton = ({ 
  children, 
  variant = "primary", 
  size = "default",
  className,
  disabled = false,
  ...props 
}) => {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    accent: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  }

  const sizes = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 py-2",
    lg: "h-11 px-8",
    icon: "h-10 w-10"
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden rounded-lg font-medium transition-all duration-300",
        "touch-target inline-flex items-center justify-center gap-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

export const JaguarRippleButton = ({ 
  children, 
  variant = "primary",
  size = "default", 
  className,
  onClick,
  rippleColor = "#ffffff",
  disabled = false,
  ...props 
}) => {
  const [ripples, setRipples] = useState([])

  const createRipple = (event) => {
    if (disabled) return
    
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    }

    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }

  const handleClick = (event) => {
    createRipple(event)
    onClick?.(event)
  }

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    accent: "bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  }

  const sizes = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 py-2",
    lg: "h-11 px-8",
    icon: "h-10 w-10"
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden rounded-lg font-medium transition-all duration-300",
        "touch-target inline-flex items-center justify-center gap-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Ripple effects */}
      <span className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full opacity-30"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: rippleColor
              }}
              initial={{ scale: 0, opacity: 0.3 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </span>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}

// Enhanced Grade Badge with animations
export const JaguarGradeBadge = ({ 
  grade, 
  isActive = false, 
  isAchieved = false,
  onClick,
  className 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
        "cursor-pointer hover:shadow-md",
        isActive && "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 ring-2 ring-amber-200",
        isAchieved && !isActive && "bg-green-50 border-green-200",
        !isAchieved && !isActive && "bg-muted/30 border-muted hover:bg-muted/50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <motion.span 
          className="text-lg"
          animate={isActive ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
        >
          {grade.emoji}
        </motion.span>
        <div>
          <p className={cn(
            "font-medium text-sm",
            isActive ? "text-amber-900" : 
            isAchieved ? "text-green-700" : 
            "text-muted-foreground"
          )}>
            {grade.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {grade.trainings} тренировок
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium"
          >
            Текущий
          </motion.div>
        )}
        {isAchieved && !isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
          >
            ✓ Получен
          </motion.div>
        )}
      </div>

      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-amber-300"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  )
}

// CSS animations
const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = shimmerKeyframes
  document.head.appendChild(style)
}