import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, TrendingUp, Users, User, Target, MessageSquare } from 'lucide-react'
import { hapticFeedback } from '../utils/haptic'

const MobileNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const clientNavItems = [
    { path: '/', label: 'Главная', icon: Home, emoji: '🏠' },
    { path: '/progress', label: 'Прогресс', icon: TrendingUp, emoji: '📊' },
    { path: '/point-a', label: 'Цели', icon: Target, emoji: '🎯' },
    { path: '/community', label: 'Чат', icon: MessageSquare, emoji: '💬' },
    { path: '/profile', label: 'Профиль', icon: User, emoji: '👤' },
  ]

  const coachNavItems = [
    { path: '/', label: 'Ученики', icon: Home, emoji: '🏠' },
    { path: '/profile', label: 'Профиль', icon: User, emoji: '👤' },
  ]

  const navItems = user?.role === 'coach' ? coachNavItems : clientNavItems

  return (
    <>
      {/* Top Header для мобильных */}
      <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-center h-14 px-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-sm">JAGUAR FIGHT CLUB</span>
          </div>
        </div>
      </header>

      {/* Bottom Tab Bar для мобильных */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  hapticFeedback.selection()
                  navigate(item.path)
                }}
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                  isActive 
                    ? 'text-orange-500 bg-orange-50' 
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium leading-none">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Desktop Navigation (скрытая на мобильных) */}
      <nav className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">JAGUAR FIGHT CLUB</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                  hapticFeedback.selection()
                  navigate(item.path)
                }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer для bottom navigation */}
      <div className="md:hidden h-16" />
    </>
  )
}

export default MobileNavigation