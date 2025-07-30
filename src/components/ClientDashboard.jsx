import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UsersAPI, ProgressAPI, CommentsAPI } from '../services/apiService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Bell, Target, TrendingUp, Users, LogOut, User, Loader2, AlertCircle, Edit, Save, ChevronDown, ChevronUp, Star, Award, Zap } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import MobileNavigation from './MobileNavigation'
import PullToRefresh from './PullToRefresh'
import { AnimatedProgressBar, StreakCounter, LevelIndicator } from './Gamification'
import { JaguarShimmerButton } from './ui/jaguar-shimmer-button'
import { JaguarRippleButton } from './ui/jaguar-ripple-button'
import { JaguarProgressRing } from './ui/jaguar-progress-ring'
import { JaguarAnimatedCounter } from './ui/jaguar-animated-counter'
import { JaguarInteractiveCard, JaguarNotificationDot } from './ui/jaguar-micro-interactions'

const ClientDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Состояния
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState(null)
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const [successMessage, setSuccessMessage] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Определение размера экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Загрузка данных дашборда
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true)
        console.log('📊 Загружаем данные дашборда...')
        
        const response = await UsersAPI.getClientDashboard()
        console.log('✅ Данные дашборда получены:', response.dashboard)
        
        setDashboardData(response.dashboard)
      } catch (error) {
        console.error('❌ Ошибка загрузки дашборда:', error)
        setError('Ошибка загрузки данных: ' + error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'client') {
      loadDashboard()
    }
  }, [user])

  // Если пользователь не заполнил анкету "Точка А", перенаправляем
  useEffect(() => {
    if (!isLoading && dashboardData && !dashboardData.hasCompletedPointA) {
      navigate('/point-a')
    }
  }, [dashboardData, isLoading, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Функция для pull-to-refresh
  const handleRefresh = async () => {
    if (isRefreshing) return
    
    try {
      setIsRefreshing(true)
      console.log('🔄 Pull-to-refresh: Обновляем данные дашборда...')
      
      const response = await UsersAPI.getClientDashboard()
      console.log('✅ Pull-to-refresh: Данные обновлены')
      
      setDashboardData(response.dashboard)
      setError('') // Очищаем ошибки при успешном обновлении
      
      // Показываем сообщение об успешном обновлении
      setSuccessMessage('Данные обновлены')
      setTimeout(() => setSuccessMessage(''), 2000)
      
    } catch (error) {
      console.error('❌ Pull-to-refresh: Ошибка обновления:', error)
      setError('Ошибка обновления данных: ' + error.message)
    } finally {
      setIsRefreshing(false)
    }
  }


  // Компонент загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNavigation />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Загружаем ваш дашборд..." />
        </div>
      </div>
    )
  }

  // Компонент ошибки
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNavigation />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Если нет данных
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNavigation />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Данные дашборда недоступны</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const { stats, grade, recentComments, notifications, pointA, currentProgress } = dashboardData

  // Формируем уведомления (только непрочитанные)
  const allNotifications = [
    // Добавляем уведомления о непрочитанных комментариях
    ...(notifications.unreadComments > 0 ? [{
      id: 'unread-comments',
      message: `У вас ${notifications.unreadComments} непрочитанных комментариев от тренеров`,
      time: 'новое',
      unread: true,
      action: () => navigate('/progress') // 🎯 Переход к странице комментариев
    }] : []),
    // Добавляем только НЕПРОЧИТАННЫЕ комментарии как уведомления
    ...recentComments
      .filter(comment => !comment.isRead) // 🔥 Фильтруем только непрочитанные
      .slice(0, 3)
      .map(comment => ({
        id: comment.id,
        message: `Новый комментарий от ${comment.coachName}`,
        time: new Date(comment.createdAt).toLocaleDateString('ru'),
        unread: true,
        action: () => navigate('/progress') // 🎯 Переход к странице комментариев
      }))
  ]

  // Обработчик клика на уведомление
  const handleNotificationClick = async (notification) => {
    try {
      // Если это конкретный комментарий (не общее уведомление)
      if (notification.id !== 'unread-comments' && notification.id) {
        // Отмечаем комментарий как прочитанный
        await CommentsAPI.markAsRead(notification.id)
        
        // Обновляем данные dashboard чтобы убрать уведомление
        await loadDashboard()
      }
      
      // Выполняем переход
      if (notification.action) {
        notification.action()
      }
    } catch (error) {
      console.error('Ошибка при обработке уведомления:', error)
      // Даже если API вызов не удался, выполняем переход
      if (notification.action) {
        notification.action()
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      
      <PullToRefresh onRefresh={handleRefresh} disabled={isLoading}>
        <div className="container mx-auto mobile-container mobile-scroll-container py-4 md:py-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4">
              <Alert className="bg-green-50 border-green-200 success-animation notification-enter">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold">Добро пожаловать, {user?.name}</h1>
              <p className="text-muted-foreground text-sm md:text-base">Ваш путь к совершенству продолжается</p>
            </div>
            <div className="flex gap-2">
              <JaguarShimmerButton 
                variant="secondary" 
                size="md"
                onClick={() => navigate('/profile')}
                className="flex-1 md:flex-none"
              >
                <User className="w-4 h-4" />
                Профиль
              </JaguarShimmerButton>
              <JaguarRippleButton 
                variant="outline" 
                size="md"
                onClick={handleLogout}
                className="flex-1 md:flex-none"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </JaguarRippleButton>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Stats Cards with Magic UI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <JaguarInteractiveCard className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Всего тренировок</p>
                      <div className="flex items-center gap-2">
                        <JaguarAnimatedCounter 
                          value={stats.totalTrainings} 
                          variant="primary" 
                          size="lg"
                          className="font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats.trainingsThisMonth} в этом месяце
                </p>
              </JaguarInteractiveCard>

              <JaguarInteractiveCard className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <TrendingUp className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">На этой неделе</p>
                      <div className="flex items-center gap-2">
                        <JaguarAnimatedCounter 
                          value={stats.trainingsThisWeek} 
                          variant="secondary" 
                          size="lg"
                          className="font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Активность недели
                </p>
              </JaguarInteractiveCard>

              <JaguarInteractiveCard className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <span className="text-xl">{grade.current.emoji}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Текущий грейд</p>
                      <div className="text-lg font-bold text-accent">{grade.current.name}</div>
                    </div>
                  </div>
                </div>
                {grade.next && (
                  <>
                    <div className="mb-2">
                      <JaguarProgressRing
                        progress={grade.progressToNext}
                        size={60}
                        variant="accent"
                        animated={true}
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      До "{grade.next.name}": {grade.next.trainings - stats.totalTrainings} тренировок
                    </p>
                  </>
                )}
              </JaguarInteractiveCard>
            </div>

            {/* Progress Comparison */}
            {pointA && (
              <Card className="mobile-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
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
                    ].filter(metric => metric.pointA !== null && metric.pointA !== undefined).map((metric) => {
                      const hasChange = metric.current !== metric.pointA;
                      const isImproved = hasChange && (
                        metric.better === 'higher' 
                          ? metric.current > metric.pointA 
                          : metric.better === 'lower' 
                            ? metric.current < metric.pointA 
                            : false
                      );
                      
                      return (
                        <div key={metric.label} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{metric.label}</span>
                            {isImproved && <Badge variant="secondary" className="text-xs">Улучшение</Badge>}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Было: {metric.pointA}{metric.unit}
                            </span>
                            <span className={`font-medium ${isImproved ? 'text-green-600' : hasChange ? 'text-orange-600' : 'text-muted-foreground'}`}>
                              Сейчас: {metric.current}{metric.unit}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {pointA.pointBGoal && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                          <Target className="w-3 h-3 text-amber-600" />
                        </div>
                        <h4 className="font-semibold text-sm text-amber-900">🎯 Ваша цель "Точка Б"</h4>
                      </div>
                      <p className="text-sm text-amber-800 font-medium leading-relaxed">
                        {pointA.pointBGoal}
                      </p>
                      <div className="mt-2 text-xs text-amber-600 font-medium">
                        💪 Продолжайте двигаться к своей мечте!
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Comments with Magic UI */}
            <JaguarInteractiveCard className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Комментарии тренеров</h3>
                    <p className="text-sm text-blue-700">Обратная связь от ваших тренеров</p>
                  </div>
                </div>
                {recentComments.some(c => !c.isRead) && (
                  <JaguarNotificationDot 
                    count={recentComments.filter(c => !c.isRead).length}
                    variant="primary"
                    size="sm"
                  />
                )}
              </div>
              
              <div className="space-y-4">
                {recentComments.length > 0 ? (
                  <>
                    {recentComments.slice(0, 1).map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`p-4 rounded-lg ${comment.isRead ? 'bg-white/50' : 'bg-primary/5 border border-primary/20'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{comment.comment || comment.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-xs text-muted-foreground">
                                {comment.coachName} • {new Date(comment.createdAt).toLocaleDateString('ru')}
                              </p>
                              {!comment.isRead && (
                                <Badge variant="secondary" className="text-xs">
                                  новое
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <JaguarShimmerButton 
                      variant="primary" 
                      size="md"
                      className="w-full" 
                      onClick={() => navigate('/progress')}
                    >
                      <Target className="w-4 h-4" />
                      Посмотреть все комментарии
                    </JaguarShimmerButton>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-full bg-blue-100 w-fit mx-auto mb-4">
                      <Target className="h-8 w-8 text-blue-400" />
                    </div>
                    <p className="font-medium text-blue-900 mb-2">Пока нет комментариев</p>
                    <p className="text-sm text-blue-700">Комментарии появятся после ваших тренировок</p>
                  </div>
                )}
              </div>
            </JaguarInteractiveCard>
          </div>

          {/* Sidebar with Magic UI */}
          <div className="space-y-4 md:space-y-6">
            {/* Notifications with Magic UI */}
            {(allNotifications.length > 0 || !isMobile) && (
              <JaguarInteractiveCard className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Bell className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-orange-900">Уведомления</h3>
                  </div>
                  {notifications.unreadComments > 0 && (
                    <JaguarNotificationDot 
                      count={notifications.unreadComments}
                      variant="primary"
                      size="md"
                    />
                  )}
                </div>
                
                <div className="space-y-3">
                  {allNotifications.length > 0 ? (
                    allNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          notification.unread ? 'bg-primary/5 border-primary/20' : 'bg-white/50 border-gray-200'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-2">
                          <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                            <Bell className="h-3 w-3 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <div className="p-3 rounded-full bg-orange-100 w-fit mx-auto mb-2">
                        <Bell className="h-6 w-6 text-orange-400" />
                      </div>
                      <p className="text-sm text-orange-700">Нет новых уведомлений</p>
                    </div>
                  )}
                </div>
              </JaguarInteractiveCard>
            )}

            {/* Система грейдов с Magic UI */}
            <JaguarInteractiveCard className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">🦁 Система грейдов</h3>
                  <p className="text-sm text-purple-700">Ваш путь от новичка до короля</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {grade.allGrades.map((gradeItem, index) => {
                  const isCurrentGrade = gradeItem.name === grade.current.name
                  const isAchieved = stats.totalTrainings >= gradeItem.trainings
                  
                  return (
                    <div 
                      key={gradeItem.name} 
                      className={`p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                        isCurrentGrade 
                          ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 ring-2 ring-primary/20' 
                          : isAchieved 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                          : 'bg-white/50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isCurrentGrade ? 'bg-primary/20' : isAchieved ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <span className="text-lg">{gradeItem.emoji}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-medium text-sm ${
                                isCurrentGrade ? 'text-primary' : isAchieved ? 'text-green-700' : 'text-muted-foreground'
                              }`}>
                                {gradeItem.name}
                              </p>
                              {isCurrentGrade && (
                                <Badge variant="default" className="text-xs">
                                  текущий
                                </Badge>
                              )}
                              {isAchieved && !isCurrentGrade && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  ✓
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <JaguarAnimatedCounter 
                                value={gradeItem.trainings} 
                                suffix=" тренировок"
                                variant={isCurrentGrade ? "primary" : isAchieved ? "success" : "secondary"}
                                size="sm"
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {!isAchieved && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {gradeItem.trainings - stats.totalTrainings} осталось
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </JaguarInteractiveCard>

            {/* Quick Actions с Magic UI */}
            <JaguarInteractiveCard className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-teal-100">
                  <Zap className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="font-semibold text-teal-900">Быстрые действия</h3>
              </div>
              
              <div className="space-y-3">
                <JaguarRippleButton 
                  variant="secondary" 
                  size="md"
                  className="w-full justify-start"
                  onClick={() => navigate('/point-a')}
                >
                  <Target className="w-4 h-4" />
                  Редактировать "Точку А"
                </JaguarRippleButton>
                
                <JaguarRippleButton 
                  variant="primary" 
                  size="md"
                  className="w-full justify-start"
                  onClick={() => navigate('/progress')}
                >
                  <TrendingUp className="w-4 h-4" />
                  Мой прогресс
                </JaguarRippleButton>
                
                <JaguarRippleButton 
                  variant="accent" 
                  size="md"
                  className="w-full justify-start"
                  onClick={() => navigate('/community')}
                >
                  <Users className="w-4 h-4" />
                  Сообщество
                </JaguarRippleButton>
                
                <JaguarRippleButton 
                  variant="success" 
                  size="md"
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-4 h-4" />
                  Редактировать профиль
                </JaguarRippleButton>
              </div>
            </JaguarInteractiveCard>
          </div>
        </div>
        </div>
      </PullToRefresh>
    </div>
  )
}

export default ClientDashboard
