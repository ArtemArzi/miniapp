import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UsersAPI, ProgressAPI, CommentsAPI } from '../services/apiService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, Target, TrendingUp, Users, LogOut, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import MobileNavigation from './MobileNavigation'
import PullToRefresh from './PullToRefresh'
import {
  JaguarStatsCard,
  JaguarMagicCard,
  JaguarShimmerButton,
  JaguarRippleButton,
  JaguarGradeBadge,
  JaguarProgressRing,
  NumberTicker
} from '@/components/ui/client-magic-components'

const EnhancedClientDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // States
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState(null)
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true)
        console.log('📊 Loading enhanced dashboard...')

        const response = await UsersAPI.getClientDashboard()
        console.log('✅ Enhanced dashboard data loaded:', response.dashboard)

        setDashboardData(response.dashboard)
      } catch (error) {
        console.error('❌ Enhanced dashboard loading error:', error)
        setError('Ошибка загрузки данных: ' + error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'client') {
      loadDashboard()
    }
  }, [user])

  // Redirect if Point A not completed
  useEffect(() => {
    if (!isLoading && dashboardData && !dashboardData.hasCompletedPointA) {
      navigate('/point-a')
    }
  }, [dashboardData, isLoading, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Pull to refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return

    try {
      setIsRefreshing(true)
      console.log('🔄 Enhanced pull-to-refresh: Updating dashboard data...')

      const response = await UsersAPI.getClientDashboard()
      console.log('✅ Enhanced pull-to-refresh: Data updated')

      setDashboardData(response.dashboard)
      setError('')

      setSuccessMessage('Данные обновлены')
      setTimeout(() => setSuccessMessage(''), 2000)

    } catch (error) {
      console.error('❌ Enhanced pull-to-refresh error:', error)
      setError('Ошибка обновления данных: ' + error.message)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Loading component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <MobileNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-amber-500/40 rounded-full animate-spin" style={{ animationDelay: '-0.15s' }}></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                Загружаем ваш дашборд...
              </h3>
              <p className="text-sm text-muted-foreground">Подготавливаем персональную информацию</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error component
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <MobileNavigation />
        <div className="container mx-auto px-4 py-8">
          <JaguarMagicCard className="max-w-md mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </JaguarMagicCard>
        </div>
      </div>
    )
  }

  // No data component
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <MobileNavigation />
        <div className="container mx-auto px-4 py-8">
          <JaguarMagicCard className="max-w-md mx-auto">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Данные дашборда недоступны</AlertDescription>
            </Alert>
          </JaguarMagicCard>
        </div>
      </div>
    )
  }

  const { stats, grade, recentComments, notifications, pointA, currentProgress } = dashboardData

  // Format notifications
  const allNotifications = [
    ...(notifications.unreadComments > 0 ? [{
      id: 'unread-comments',
      message: `У вас ${notifications.unreadComments} непрочитанных комментариев от тренеров`,
      time: 'новое',
      unread: true,
      action: () => navigate('/progress')
    }] : []),
    ...recentComments
      .filter(comment => !comment.isRead)
      .slice(0, 3)
      .map(comment => ({
        id: comment.id,
        message: `Новый комментарий от ${comment.coachName}`,
        time: new Date(comment.createdAt).toLocaleDateString('ru'),
        unread: true,
        action: () => navigate('/progress')
      }))
  ]

  // Enhanced notification click handler
  const handleNotificationClick = async (notification) => {
    try {
      if (notification.id !== 'unread-comments' && notification.id) {
        await CommentsAPI.markAsRead(notification.id)
        // Reload dashboard to update notification count
        const response = await UsersAPI.getClientDashboard()
        setDashboardData(response.dashboard)
      }

      if (notification.action) {
        notification.action()
      }
    } catch (error) {
      console.error('Notification handling error:', error)
      if (notification.action) {
        notification.action()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <MobileNavigation />

      <PullToRefresh onRefresh={handleRefresh} disabled={isLoading}>
        <div className="container mx-auto mobile-container mobile-scroll-container py-4 md:py-8">
          {/* Success Message with enhanced styling */}
          {successMessage && (
            <div className="mb-4">
              <JaguarMagicCard className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" glowEffect>
                <Alert className="border-0 bg-transparent">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              </JaguarMagicCard>
            </div>
          )}

          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
            <div className="mb-4 md:mb-0 space-y-2">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent">
                Добро пожаловать, {user?.name}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Ваш путь к совершенству продолжается
              </p>
            </div>
            <div className="flex gap-2">
              <JaguarRippleButton
                variant="secondary"
                onClick={() => navigate('/profile')}
                className="touch-target min-h-[44px] flex-1 md:flex-none"
                rippleColor="var(--jaguar-secondary)"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">Профиль</span>
              </JaguarRippleButton>
              <JaguarShimmerButton
                variant="accent"
                onClick={handleLogout}
                className="touch-target min-h-[44px] flex-1 md:flex-none"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm">Выйти</span>
              </JaguarShimmerButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <JaguarStatsCard
                  title="Всего тренировок"
                  value={stats.totalTrainings}
                  change={`+${stats.trainingsThisMonth} в этом месяце`}
                  icon={<Target className="h-5 w-5 text-primary" />}
                  delay={0}
                  trend="up"
                />

                <JaguarStatsCard
                  title="На этой неделе"
                  value={stats.trainingsThisWeek}
                  change="Активность недели"
                  icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
                  delay={1}
                  trend="up"
                />

                <JaguarStatsCard
                  title="Текущий грейд"
                  value={grade.current.name}
                  change={grade.next ? `До "${grade.next.name}": ${grade.next.trainings - stats.totalTrainings} тренировок` : 'Максимальный грейд достигнут'}
                  icon={<span className="text-xl animate-bounce">{grade.current.emoji}</span>}
                  delay={2}
                  trend="up"
                  className="md:col-span-1"
                />
              </div>

              {/* Enhanced Progress Comparison */}
              {pointA && (
                <JaguarMagicCard gradientColor="var(--jaguar-gradient-primary)" glowEffect>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Прогресс показателей
                        </CardTitle>
                        <CardDescription>
                          Сравнение "Точки А" с текущими результатами
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
                        className="md:hidden touch-target"
                      >
                        {showDetailedMetrics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!showDetailedMetrics ? 'md:block hidden' : ''}`}>
                      {[
                        {
                          label: 'Вес',
                          pointA: pointA.weight,
                          current: currentProgress?.weight || pointA.weight,
                          unit: 'кг',
                          better: 'depends'
                        },
                        {
                          label: 'Жир',
                          pointA: pointA.bodyFatPercentage,
                          current: currentProgress?.bodyFatPercentage || pointA.bodyFatPercentage,
                          unit: '%',
                          better: 'lower'
                        },
                        {
                          label: 'Планка',
                          pointA: pointA.plankTime,
                          current: currentProgress?.plankTime || pointA.plankTime,
                          unit: 'сек',
                          better: 'higher'
                        },
                        {
                          label: 'Удары/мин',
                          pointA: pointA.punchesPerMinute,
                          current: currentProgress?.punchesPerMinute || pointA.punchesPerMinute,
                          unit: '',
                          better: 'higher'
                        },
                        {
                          label: 'Энергия',
                          pointA: pointA.energy,
                          current: currentProgress?.energy || pointA.energy,
                          unit: '/10',
                          better: 'higher'
                        },
                        {
                          label: 'Стресс',
                          pointA: pointA.stress,
                          current: currentProgress?.stress || pointA.stress,
                          unit: '/10',
                          better: 'lower'
                        },
                        {
                          label: 'Сон',
                          pointA: pointA.sleep,
                          current: currentProgress?.sleep || pointA.sleep,
                          unit: '/10',
                          better: 'higher'
                        },
                        {
                          label: 'Питание',
                          pointA: pointA.nutrition,
                          current: currentProgress?.nutrition || pointA.nutrition,
                          unit: '/10',
                          better: 'higher'
                        }
                      ].filter(metric => metric.pointA !== null && metric.pointA !== undefined).map((metric, index) => {
                        const hasChange = metric.current !== metric.pointA;
                        const isImproved = hasChange && (
                          metric.better === 'higher'
                            ? metric.current > metric.pointA
                            : metric.better === 'lower'
                            ? metric.current < metric.pointA
                            : false
                        );

                        return (
                          <JaguarMagicCard
                            key={metric.label}
                            className={`p-3 transition-all duration-300 hover:scale-[1.02] ${
                              isImproved
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                : hasChange
                                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                                : 'border'
                            }`}
                            gradientColor={isImproved ? "var(--jaguar-secondary)" : "var(--jaguar-primary)"}
                            animated
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">{metric.label}</span>
                              {isImproved && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 animate-pulse">
                                  Улучшение
                                </Badge>
                              )}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Было: <NumberTicker value={metric.pointA} />{metric.unit}
                              </span>
                              <span className={`font-medium ${
                                isImproved ? 'text-green-600' : hasChange ? 'text-amber-600' : 'text-muted-foreground'
                              }`}>
                                Сейчас: <NumberTicker value={metric.current} />{metric.unit}
                              </span>
                            </div>
                          </JaguarMagicCard>
                        )
                      })}
                    </div>

                    {pointA.pointBGoal && (
                      <div className="mt-4 relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-full -translate-y-8 translate-x-8"></div>

                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-lg">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-amber-900">🎯 Ваша цель "Точка Б"</h3>
                            <p className="text-xs text-amber-700 font-medium">К чему вы стремитесь</p>
                          </div>
                        </div>

                        <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-amber-200/50">
                          <p className="text-sm leading-relaxed text-gray-800 font-medium">
                            "{pointA.pointBGoal}"
                          </p>
                        </div>

                        <div className="mt-4 text-center relative z-10">
                          <p className="text-xs text-amber-700 font-medium italic">
                            💪 Каждая тренировка приближает вас к цели!
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </JaguarMagicCard>
              )}

              {/* Enhanced Recent Comments */}
              <JaguarMagicCard gradientColor="var(--jaguar-gradient-accent)">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-violet-500" />
                    Последние комментарии тренеров
                  </CardTitle>
                  <CardDescription>
                    Обратная связь от ваших тренеров
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentComments.length > 0 ? (
                    <>
                      {recentComments.slice(0, 1).map((comment) => (
                        <div
                          key={comment.id}
                          className={`relative p-4 rounded-lg border-l-4 ${
                            comment.isRead ? 'border-muted bg-muted/30' : 'border-primary bg-primary/5'
                          } transition-all duration-300 hover:bg-opacity-80`}
                        >
                          {!comment.isRead && (
                            <div className="absolute -left-1 top-4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          )}
                          <p className="font-medium text-sm mb-2">{comment.comment || comment.text}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{comment.coachName}</span>
                            <span>•</span>
                            <span>{new Date(comment.createdAt).toLocaleDateString('ru')}</span>
                            {!comment.isRead && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary animate-pulse">
                                новое
                              </Badge>
                            )}
                          </p>
                        </div>
                      ))}

                      <JaguarShimmerButton
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/progress')}
                      >
                        Посмотреть все комментарии
                      </JaguarShimmerButton>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Пока нет комментариев от тренеров</p>
                      <p className="text-sm">Комментарии появятся после ваших тренировок</p>
                    </div>
                  )}
                </CardContent>
              </JaguarMagicCard>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Enhanced Notifications */}
              {(allNotifications.length > 0 || !isMobile) && (
                <JaguarMagicCard gradientColor="var(--jaguar-gradient-accent)" glowEffect>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-violet-500" />
                      Уведомления
                      {notifications.unreadComments > 0 && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          <NumberTicker value={notifications.unreadComments} />
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {allNotifications.length > 0 ? (
                      allNotifications.map((notification, index) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md ${
                            notification.unread
                              ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:from-primary/10 hover:to-primary/15'
                              : 'bg-muted/50 hover:bg-muted/70'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start gap-2">
                            {notification.unread && (
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse mt-2 flex-shrink-0"></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground text-sm py-4">
                        Нет новых уведомлений
                      </p>
                    )}
                  </CardContent>
                </JaguarMagicCard>
              )}

              {/* Enhanced Grade System */}
              <JaguarMagicCard gradientColor="var(--jaguar-gradient-primary)" glowEffect>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl animate-bounce">🦁</span>
                    Система грейдов
                  </CardTitle>
                  <CardDescription>
                    Ваш путь от новичка до короля
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {grade.allGrades.map((gradeItem, index) => {
                    const isCurrentGrade = gradeItem.name === grade.current.name
                    const isAchieved = stats.totalTrainings >= gradeItem.trainings

                    return (
                      <JaguarGradeBadge
                        key={gradeItem.name}
                        grade={gradeItem}
                        isActive={isCurrentGrade}
                        isAchieved={isAchieved}
                        onClick={() => {
                          // Optional: Add grade details modal or navigation
                        }}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      />
                    )
                  })}
                </CardContent>
              </JaguarMagicCard>

              {/* Enhanced Quick Actions */}
              <JaguarMagicCard>
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <JaguarRippleButton
                    variant="outline"
                    className="w-full justify-start touch-target min-h-[48px] text-sm"
                    onClick={() => navigate('/point-a')}
                    rippleColor="var(--jaguar-primary)"
                  >
                    <Target className="w-5 h-5 mr-3" />
                    Редактировать "Точку А"
                  </JaguarRippleButton>

                  <JaguarRippleButton
                    variant="outline"
                    className="w-full justify-start touch-target min-h-[48px] text-sm"
                    onClick={() => navigate('/progress')}
                    rippleColor="var(--jaguar-secondary)"
                  >
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Мой прогресс
                  </JaguarRippleButton>

                  <JaguarRippleButton
                    variant="outline"
                    className="w-full justify-start touch-target min-h-[48px] text-sm"
                    onClick={() => navigate('/community')}
                    rippleColor="var(--jaguar-accent)"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    Сообщество
                  </JaguarRippleButton>

                  <JaguarRippleButton
                    variant="outline"
                    className="w-full justify-start touch-target min-h-[48px] text-sm"
                    onClick={() => navigate('/profile')}
                    rippleColor="var(--jaguar-primary)"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Редактировать профиль
                  </JaguarRippleButton>
                </CardContent>
              </JaguarMagicCard>
            </div>
          </div>
        </div>
      </PullToRefresh>
    </div>
  )
}

export default EnhancedClientDashboard