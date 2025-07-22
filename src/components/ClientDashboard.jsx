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
import { Bell, Target, TrendingUp, Users, LogOut, User, Loader2, AlertCircle, Edit, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import MobileNavigation from './MobileNavigation'
import PullToRefresh from './PullToRefresh'
import { AnimatedProgressBar, StreakCounter, LevelIndicator } from './Gamification'

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
        <div className="container mx-auto mobile-container py-4 md:py-8">
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
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="touch-target min-h-[44px] flex-1 md:flex-none button-press interactive-hover"
              >
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">Профиль</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="touch-target min-h-[44px] flex-1 md:flex-none button-press interactive-hover"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm">Выйти</span>
              </Button>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="mobile-card card-animation interactive-hover fade-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего тренировок</CardTitle>
                  <Target className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">{stats.totalTrainings}</div>
                  <p className="text-xs text-muted-foreground mobile-text">
                    +{stats.trainingsThisMonth} в этом месяце
                  </p>
                </CardContent>
              </Card>

              <Card className="mobile-card card-animation interactive-hover fade-in" style={{animationDelay: '0.1s'}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">На этой неделе</CardTitle>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">{stats.trainingsThisWeek}</div>
                  <p className="text-xs text-muted-foreground mobile-text">
                    Активность недели
                  </p>
                </CardContent>
              </Card>

              <Card className="mobile-card card-animation interactive-hover fade-in" style={{animationDelay: '0.2s'}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Текущий грейд</CardTitle>
                  <span className="text-xl md:text-2xl pulse-animation">{grade.current.emoji}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{grade.current.name}</div>
                  {grade.next && (
                    <>
                      <AnimatedProgressBar
                        value={grade.progressToNext}
                        max={100}
                        label={`До "${grade.next.name}"`}
                        color="orange"
                        size="md"
                      />
                      <p className="text-xs text-muted-foreground mt-1 mobile-text">
                        Осталось: {grade.next.trainings - stats.totalTrainings} тренировок
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
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

            {/* Recent Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Последние комментарии тренеров</CardTitle>
                <CardDescription>
                  Обратная связь от ваших тренеров
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentComments.length > 0 ? (
                  <>
                    {/* Показываем только ПОСЛЕДНИЙ комментарий */}
                    {recentComments.slice(0, 1).map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`border-l-4 ${comment.isRead ? 'border-muted' : 'border-primary'} pl-4`}
                      >
                        <p className="font-medium">{comment.comment || comment.text}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {comment.coachName} • {new Date(comment.createdAt).toLocaleDateString('ru')}
                          {!comment.isRead && <span className="ml-2 text-primary">• новое</span>}
                        </p>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full" onClick={() => navigate('/progress')}>
                      Посмотреть все комментарии
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Пока нет комментариев от тренеров</p>
                    <p className="text-sm">Комментарии появятся после ваших тренировок</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Notifications - скрыть на мобильных если пустые */}
            {(allNotifications.length > 0 || !isMobile) && (
              <Card className="mobile-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Уведомления
                    {notifications.unreadComments > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {notifications.unreadComments}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {allNotifications.length > 0 ? (
                    allNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-opacity-80 transition-all duration-300 transform hover:scale-[1.02] ${
                          notification.unread ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-muted/50 hover:bg-muted/70'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                        title="Нажмите чтобы перейти к комментариям"
                      >
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Нет новых уведомлений
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Система грейдов */}
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="text-lg">🦁 Система грейдов</CardTitle>
                <CardDescription>
                  Ваш путь от новичка до короля
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {grade.allGrades.map((gradeItem, index) => {
                  const isCurrentGrade = gradeItem.name === grade.current.name
                  const isAchieved = stats.totalTrainings >= gradeItem.trainings
                  
                  return (
                    <div 
                      key={gradeItem.name} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCurrentGrade 
                          ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20' 
                          : isAchieved 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-muted/30 border-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{gradeItem.emoji}</span>
                        <div>
                          <p className={`font-medium text-sm ${
                            isCurrentGrade ? 'text-primary' : isAchieved ? 'text-green-700' : 'text-muted-foreground'
                          }`}>
                            {gradeItem.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {gradeItem.trainings} тренировок
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCurrentGrade && (
                          <Badge variant="default" className="text-xs">
                            Текущий
                          </Badge>
                        )}
                        {isAchieved && !isCurrentGrade && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Получен
                          </Badge>
                        )}
                        {!isAchieved && (
                          <Badge variant="outline" className="text-xs">
                            {gradeItem.trainings - stats.totalTrainings} осталось
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start touch-target min-h-[48px] text-sm"
                  onClick={() => navigate('/point-a')}
                >
                  <Target className="w-5 h-5 mr-3" />
                  Редактировать "Точку А"
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start touch-target min-h-[48px] text-sm"
                  onClick={() => navigate('/progress')}
                >
                  <TrendingUp className="w-5 h-5 mr-3" />
                  Мой прогресс
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start touch-target min-h-[48px] text-sm"
                  onClick={() => navigate('/community')}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Сообщество
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start touch-target min-h-[48px] text-sm"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-5 h-5 mr-3" />
                  Редактировать профиль
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </PullToRefresh>
    </div>
  )
}

export default ClientDashboard
