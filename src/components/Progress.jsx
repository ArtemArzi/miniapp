import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UsersAPI, CommentsAPI, PointAAPI, ProgressAPI } from '../services/apiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, MessageSquare, Target, Calendar, Loader2, AlertCircle, RefreshCw, Edit, Save } from 'lucide-react'
import MobileNavigation from './MobileNavigation'
import PullToRefresh from './PullToRefresh'
// Magic UI imports
// import { JaguarShimmerButton } from './ui/jaguar-shimmer-button'
// import { JaguarRippleButton } from './ui/jaguar-ripple-button'
import { JaguarProgressRing } from './ui/jaguar-progress-ring'
import { JaguarAnimatedCounter } from './ui/jaguar-animated-counter'
import { JaguarInteractiveCard, JaguarNotificationDot } from './ui/jaguar-micro-interactions'
// import { TextAnimate } from './ui/jaguar-text-animate'
import { NumberTicker } from './ui/jaguar-number-ticker'

const Progress = () => {
  const { user, isClient } = useAuth()
  
  // API состояние
  const [dashboardData, setDashboardData] = useState(null)
  const [pointAData, setPointAData] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const [commentsPagination, setCommentsPagination] = useState(null)
  
  // Состояния для формы обновления прогресса
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [progressForm, setProgressForm] = useState({
    weight: '',
    body_fat_percentage: '',
    plank_time: '',
    punches_per_minute: '',
    energy_level: '',
    stress_level: '',
    sleep_quality: '',
    nutrition_quality: '',
    emotions_level: '',
    intimacy_level: ''
  })

  // Загрузка данных прогресса
  const loadProgressData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      console.log('📊 Загрузка данных прогресса для клиента...')
      
      // Загружаем dashboard данные (они уже включают все необходимое)
      const dashboardResponse = await UsersAPI.getClientDashboard()

      // Обработка dashboard данных
      if (dashboardResponse && dashboardResponse.dashboard) {
        const dashboard = dashboardResponse.dashboard
        setDashboardData(dashboard)
        setPointAData(dashboard.pointA)
        console.log('✅ Все данные загружены из dashboard')
      } else {
        throw new Error('Не удалось загрузить данные dashboard')
      }

      // Загружаем комментарии отдельно с пагинацией
      try {
        const commentsResponse = await CommentsAPI.getComments({ all: showAllComments })
        setComments(commentsResponse.comments || [])
        setCommentsPagination(commentsResponse.pagination)
      } catch (error) {
        console.warn('Ошибка загрузки комментариев:', error)
        setComments([])
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки данных прогресса:', error)
      setError(error.message || 'Ошибка загрузки данных прогресса')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Загрузка при монтировании
  useEffect(() => {
    if (isClient) {
      loadProgressData()
    }
  }, [isClient, showAllComments])

  // Функция для переключения отображения всех комментариев
  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments)
  }

  // Обновление данных
  const handleRefresh = () => {
    loadProgressData(true)
  }

  // Функция для обновления прогресса
  const handleUpdateProgress = async () => {
    try {
      setIsSavingProgress(true)
      setError('')

      // Фильтруем только заполненные поля
      const filteredData = {}
      Object.keys(progressForm).forEach(key => {
        const value = progressForm[key]
        if (value !== '' && value !== null && value !== undefined) {
          // Преобразуем в числа
          filteredData[key] = parseFloat(value) || value
        }
      })

      if (Object.keys(filteredData).length === 0) {
        setError('Необходимо заполнить хотя бы одно поле')
        return
      }

      const response = await ProgressAPI.updateProgress(filteredData)

      if (response.success) {
        setShowProgressForm(false)
        
        // Сбрасываем форму
        setProgressForm({
          weight: '',
          body_fat_percentage: '',
          plank_time: '',
          punches_per_minute: '',
          energy_level: '',
          stress_level: '',
          sleep_quality: '',
          nutrition_quality: '',
          emotions_level: '',
          intimacy_level: ''
        })
        
        // Перезагружаем данные прогресса
        loadProgressData()
      } else {
        throw new Error(response.message || 'Не удалось обновить показатели')
      }

    } catch (error) {
      console.error('Ошибка обновления прогресса:', error)
      setError('Не удалось обновить показатели: ' + error.message)
    } finally {
      setIsSavingProgress(false)
    }
  }

  // Если пользователь не клиент
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNavigation />
        <div className="container mx-auto mobile-container mobile-scroll-container py-4 md:py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Страница прогресса доступна только для клиентов
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Расчет прогресса на основе реальных данных
  const calculateProgress = (pointA, current) => {
    if (!pointA || !current) return 0
    
    const improvements = [
      current.weight < pointA.weight ? 1 : 0,
      current.bodyFatPercentage < pointA.bodyFatPercentage ? 1 : 0,
      current.plankTime > pointA.plankTime ? 1 : 0,
      current.punchesPerMinute > pointA.punchesPerMinute ? 1 : 0,
      current.energy > pointA.energy ? 1 : 0,
      current.stress < pointA.stress ? 1 : 0,
      current.sleep > pointA.sleep ? 1 : 0,
      current.nutrition > pointA.nutrition ? 1 : 0,
      current.emotions > pointA.emotions ? 1 : 0,
      current.intimacy > pointA.intimacy ? 1 : 0
    ]
    return (improvements.reduce((a, b) => a + b, 0) / improvements.length) * 100
  }

  // Создание mock current данных если нет реальных (для демо)
  const createMockCurrentData = (pointA) => {
    if (!pointA) return null
    
    return {
      weight: Math.max(pointA.weight - 2, 60),
      bodyFatPercentage: Math.max(pointA.bodyFatPercentage - 3, 8),
      plankTime: pointA.plankTime + 30,
      punchesPerMinute: pointA.punchesPerMinute + 20,
      energy: Math.min(pointA.energy + 2, 10),
      stress: Math.max(pointA.stress - 2, 1),
      sleep: Math.min(pointA.sleep + 2, 10),
      nutrition: Math.min(pointA.nutrition + 1, 10),
      emotions: Math.min(pointA.emotions + 1, 10),
      intimacy: Math.min(pointA.intimacy + 1, 10)
    }
  }

  // Временное решение - используем улучшенную формулу расчета
  const calculateImprovedProgress = (pointA, current) => {
    if (!pointA || !current) return 0
    
    console.log('🔄 Расчет прогресса:', { pointA, current })
    
    // Субъективные показатели от 1 до 10
    const subjectiveFields = [
      { field: 'energy', pointA: pointA.energy, current: current.energy },
      { field: 'stress', pointA: pointA.stress, current: current.stress, inverted: true },
      { field: 'sleep', pointA: pointA.sleep, current: current.sleep },
      { field: 'nutrition', pointA: pointA.nutrition, current: current.nutrition },
      { field: 'emotions', pointA: pointA.emotions, current: current.emotions },
      { field: 'intimacy', pointA: pointA.intimacy, current: current.intimacy }
    ]
    
    let totalPointA = 0
    let totalCurrent = 0
    let count = 0
    
    subjectiveFields.forEach(({ field, pointA: pA, current: curr, inverted }) => {
      if (pA && curr) {
        // Для стресса инвертируем (меньше стресс = лучше)
        if (inverted) {
          totalPointA += (11 - pA)
          totalCurrent += (11 - curr)
        } else {
          totalPointA += pA
          totalCurrent += curr
        }
        count++
      }
    })
    
    if (count === 0) return 0
    
    const avgPointA = totalPointA / count
    const avgCurrent = totalCurrent / count
    
    // Формула из ТЗ: (Среднее текущее - Среднее А) / (10 - Среднее А) * 100
    const progress = ((avgCurrent - avgPointA) / (10 - avgPointA)) * 100
    
    console.log('📊 Результат расчета:', {
      avgPointA,
      avgCurrent,
      progress: Math.max(0, Math.min(100, progress))
    })
    
    return Math.max(0, Math.min(100, Math.round(progress * 100) / 100))
  }

  // Данные для расчета прогресса из dashboard
  const currentData = dashboardData?.currentProgress
  const overallProgress = pointAData && currentData ? calculateImprovedProgress(pointAData, currentData) : 0

  // Форматирование даты для комментариев
  const formatCommentDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      
      <PullToRefresh onRefresh={() => loadProgressData(true)} disabled={isLoading}>
        <div className="container mx-auto mobile-container mobile-scroll-container py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Мой прогресс
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">Отслеживайте свой путь от "Точки А" к цели</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="touch-target min-h-[44px] w-full md:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Обновить</span>
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2"
              >
                Попробовать снова
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Загрузка данных прогресса...</span>
          </div>
        )}

        {/* No Point A Data */}
        {!isLoading && !pointAData && !error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Для отслеживания прогресса необходимо заполнить анкету "Точка А".
              <Button 
                variant="link" 
                onClick={() => window.location.href = '/point-a'}
                className="ml-2 p-0 h-auto"
              >
                Заполнить анкету
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {!isLoading && pointAData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Progress */}
              <JaguarInteractiveCard className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <span>
                      Общий прогресс
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Ваш путь от "Точки А" к поставленной цели
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Прогресс к цели</span>
                      <span className={`text-sm font-medium ${
                        overallProgress > 0 ? 'text-green-600' : 
                        overallProgress < 0 ? 'text-red-600' : 
                        'text-muted-foreground'
                      }`}>
                        <NumberTicker
                          value={Math.round(overallProgress)}
                          delay={0.2}
                        />%
                      </span>
                    </div>
                    <div className="flex justify-center my-4">
                      <JaguarProgressRing 
                        progress={Math.abs(overallProgress)} 
                        size={120}
                        strokeWidth={8}
                        showText={false}
                        variant={overallProgress < 0 ? "primary" : overallProgress > 50 ? "success" : "accent"}
                      />
                    </div>
                    
                    {/* Предупреждение при отрицательном прогрессе */}
                    {overallProgress < 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Некоторые показатели ухудшились. Рекомендуем обратиться к тренеру для корректировки программы.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Мотивационная карточка с целью */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg">
                      {/* Декоративный элемент */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-full -translate-y-8 translate-x-8"></div>
                      
                      {/* Заголовок с иконкой */}
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-lg">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-amber-900">
                            🎯 Ваша цель "Точка Б"
                          </div>
                          <p className="text-xs text-amber-700 font-medium">К чему вы стремитесь</p>
                        </div>
                      </div>
                      
                      {/* Текст цели */}
                      <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-amber-200/50">
                        <p className="text-sm leading-relaxed text-gray-800 font-medium">
                          "{pointAData.pointBGoal || "Улучшить физическую форму и освоить технику Muay Thai"}"
                        </p>
                      </div>
                      
                      {/* Мотивационная подпись */}
                      <div className="mt-4 text-center relative z-10">
                        <p className="text-xs text-amber-700 font-medium italic">
                          💪 Каждая тренировка приближает вас к цели!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </JaguarInteractiveCard>

              {/* Detailed Metrics */}
              <JaguarInteractiveCard className="border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                <CardHeader>
                  <CardTitle>
                    <div>
                      Детальные показатели
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Сравнение "Точки А" с текущими результатами
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData && pointAData && [
                      { 
                        label: 'Вес', 
                        pointA: pointAData.weight, 
                        current: dashboardData.currentProgress?.weight || pointAData.weight, 
                        unit: 'кг', 
                        better: 'lower' 
                      },
                      { 
                        label: 'Жир', 
                        pointA: pointAData.bodyFatPercentage, 
                        current: dashboardData.currentProgress?.bodyFatPercentage || pointAData.bodyFatPercentage, 
                        unit: '%', 
                        better: 'lower' 
                      },
                      { 
                        label: 'Планка', 
                        pointA: pointAData.plankTime, 
                        current: dashboardData.currentProgress?.plankTime || pointAData.plankTime, 
                        unit: 'сек', 
                        better: 'higher' 
                      },
                      { 
                        label: 'Удары/мин', 
                        pointA: pointAData.punchesPerMinute, 
                        current: dashboardData.currentProgress?.punchesPerMinute || pointAData.punchesPerMinute, 
                        unit: '', 
                        better: 'higher' 
                      },
                      { 
                        label: 'Энергия', 
                        pointA: pointAData.energy, 
                        current: dashboardData.currentProgress?.energy || pointAData.energy, 
                        unit: '/10', 
                        better: 'higher' 
                      },
                      { 
                        label: 'Стресс', 
                        pointA: pointAData.stress, 
                        current: dashboardData.currentProgress?.stress || pointAData.stress, 
                        unit: '/10', 
                        better: 'lower' 
                      },
                      { 
                        label: 'Сон', 
                        pointA: pointAData.sleep, 
                        current: dashboardData.currentProgress?.sleep || pointAData.sleep, 
                        unit: '/10', 
                        better: 'higher' 
                      },
                      { 
                        label: 'Питание', 
                        pointA: pointAData.nutrition, 
                        current: dashboardData.currentProgress?.nutrition || pointAData.nutrition, 
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
                      
                      // Определяем ухудшение (противоположно улучшению)
                      const isWorsened = hasChange && !isImproved && (
                        metric.better === 'higher' 
                          ? metric.current < metric.pointA 
                          : metric.better === 'lower' 
                            ? metric.current > metric.pointA 
                            : false
                      );
                      
                      // Определяем цвет и badge
                      const getStatusColor = () => {
                        if (isImproved) return 'text-green-600';
                        if (isWorsened) return 'text-red-600';
                        return 'text-muted-foreground';
                      };
                      
                      const getStatusBadge = () => {
                        if (isImproved) return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Улучшение</Badge>;
                        if (isWorsened) return <Badge variant="destructive" className="text-xs">Ухудшение</Badge>;
                        return null;
                      };
                      
                      const getBorderStyle = () => {
                        if (isImproved) return 'border-green-200 bg-green-50/30';
                        if (isWorsened) return 'border-red-200 bg-red-50/30';
                        return 'border';
                      };
                      
                      return (
                        <JaguarInteractiveCard key={metric.label} className={`p-3 ${getBorderStyle()}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{metric.label}</span>
                            {getStatusBadge()}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Было: <NumberTicker value={metric.pointA} delay={0.1} />{metric.unit}
                            </span>
                            <span className={`font-medium ${getStatusColor()}`}>
                              Сейчас: <NumberTicker value={metric.current} delay={0.3} />{metric.unit}
                            </span>
                          </div>
                        </JaguarInteractiveCard>
                      )
                    })}
                  </div>
                  
                  {(!dashboardData?.currentProgress && pointAData) && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm">
                        💡 Обновите свои показатели для отслеживания прогресса
                      </p>
                    </div>
                  )}
                  
                  {pointAData?.pointBGoal && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-400 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Target className="w-3 h-3 text-emerald-600" />
                        </div>
                        <h4 className="font-semibold text-sm text-emerald-900">Движение к цели</h4>
                      </div>
                      <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                        {pointAData.pointBGoal}
                      </p>
                      <div className="mt-2 text-xs text-emerald-600 font-medium">
                        🚀 Прогресс: <NumberTicker value={Math.round(overallProgress)} delay={0.5} />% завершено
                      </div>
                    </div>
                  )}
                  
                  {/* Кнопка для обновления прогресса */}
                  <div className="mt-4">
                    <Dialog open={showProgressForm} onOpenChange={setShowProgressForm}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start touch-target min-h-[48px] bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border-blue-200 text-blue-800 hover:text-blue-900"
                        >
                          <Edit className="w-5 h-5 mr-3" />
                          <span className="text-sm font-medium">Изменить прогресс</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl scroll-smooth">
                        <DialogHeader>
                          <DialogTitle>Изменить прогресс</DialogTitle>
                          <DialogDescription>
                            Заполните только те поля, которые хотите обновить. Пустые поля будут проигнорированы.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 gap-6 keyboard-visible-modal:gap-4 md:grid-cols-2 md:gap-4">
                          {/* Физические показатели */}
                          <div className="space-y-4">
                            <h3 className="font-medium text-lg">Физические показатели</h3>
                            
                            <div className="space-y-2">
                              <Label htmlFor="weight">Вес (кг)</Label>
                              <Input
                                id="weight"
                                type="number"
                                step="0.1"
                                value={progressForm.weight}
                                onChange={(e) => setProgressForm(prev => ({
                                  ...prev,
                                  weight: e.target.value
                                }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="body_fat">% жира</Label>
                              <Input
                                id="body_fat"
                                type="number"
                                step="0.1"
                                value={progressForm.body_fat_percentage}
                                onChange={(e) => setProgressForm(prev => ({
                                  ...prev,
                                  body_fat_percentage: e.target.value
                                }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="plank">Время планки (сек)</Label>
                              <Input
                                id="plank"
                                type="number"
                                value={progressForm.plank_time}
                                onChange={(e) => setProgressForm(prev => ({
                                  ...prev,
                                  plank_time: e.target.value
                                }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="punches">Удары в минуту</Label>
                              <Input
                                id="punches"
                                type="number"
                                value={progressForm.punches_per_minute}
                                onChange={(e) => setProgressForm(prev => ({
                                  ...prev,
                                  punches_per_minute: e.target.value
                                }))}
                              />
                            </div>
                          </div>

                          {/* Самооценка */}
                          <div className="space-y-4">
                            <h3 className="font-medium text-lg">Самооценка (1-10)</h3>
                            
                            {[
                              { field: 'energy_level', label: 'Энергия' },
                              { field: 'stress_level', label: 'Стресс' },
                              { field: 'sleep_quality', label: 'Качество сна' },
                              { field: 'nutrition_quality', label: 'Качество питания' },
                              { field: 'emotions_level', label: 'Эмоциональное состояние' },
                              { field: 'intimacy_level', label: 'Интимность' }
                            ].map(({ field, label }) => (
                              <div key={field} className="space-y-2">
                                <Label htmlFor={field}>{label}</Label>
                                <Input
                                  id={field}
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={progressForm[field]}
                                  onChange={(e) => setProgressForm(prev => ({
                                    ...prev,
                                    [field]: e.target.value
                                  }))}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                          <Button 
                            onClick={handleUpdateProgress}
                            disabled={isSavingProgress}
                            className="flex-1"
                          >
                            {isSavingProgress ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Сохранение...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Сохранить показатели
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowProgressForm(false)}
                            disabled={isSavingProgress}
                          >
                            Отмена
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </JaguarInteractiveCard>
          </div>

            {/* Sidebar - Comments History */}
            <div className="space-y-6">
              <JaguarInteractiveCard className="border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      <div>
                        История комментариев
                      </div>
                      <JaguarNotificationDot>
                        (<NumberTicker value={comments.length} />)
                      </JaguarNotificationDot>
                    </div>
                    {commentsPagination && commentsPagination.total > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleShowAllComments}
                        className="text-xs"
                      >
                        {showAllComments ? 'Показать последние 3' : `Показать все (${commentsPagination.total})`}
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Обратная связь от тренеров
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <JaguarInteractiveCard key={comment.id} className="border-l-4 border-primary pl-4 pb-4 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>
                        <div className="font-medium text-sm mb-2">
                          {comment.comment || comment.text}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {comment.coachName || 'Тренер'}
                        </p>
                      </JaguarInteractiveCard>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Пока нет комментариев от тренеров
                      </p>
                    </div>
                  )}
                </CardContent>
              </JaguarInteractiveCard>

              {/* Achievement Status */}
              <JaguarInteractiveCard className="border-orange-200/50 bg-gradient-to-br from-orange-50/30 to-yellow-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <div>
                      🦁 Грейд JAGUAR
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <Badge className={`text-lg px-4 py-2 ${
                        dashboardData?.grade?.current?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        <div>
                          {dashboardData?.grade?.current?.emoji || '🥊'} {dashboardData?.grade?.current?.name || 'Новичок'}
                        </div>
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Текущий грейд (<NumberTicker value={dashboardData?.stats?.totalTrainings || 0} /> тренировок)
                      </p>
                    </div>
                    
                    {dashboardData?.grade?.next && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>До грейда "{dashboardData.grade.next.emoji} {dashboardData.grade.next.name}"</span>
                          <NumberTicker value={dashboardData.grade.progressToNext || 0} />%
                        </div>
                        <div className="flex justify-center my-2">
                          <JaguarProgressRing 
                            progress={dashboardData.grade.progressToNext || 0} 
                            size={80} 
                            strokeWidth={4}
                            showText={false}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Осталось <NumberTicker value={Math.max(0, dashboardData.grade.next.trainings - dashboardData.stats.totalTrainings)} delay={0.2} /> тренировок
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground mb-2">Все грейды:</p>
                      <div className="space-y-1 text-xs">
                        {dashboardData?.grade?.allGrades?.map((grade, index) => {
                          const isCompleted = dashboardData.stats.totalTrainings >= grade.trainings
                          const isCurrent = dashboardData.grade.current.name === grade.name
                          
                          return (
                            <div key={index} className="flex justify-between">
                              <span className={isCurrent ? 'font-medium' : ''}>
                                {grade.emoji} {grade.name}
                              </span>
                              <span className={
                                isCompleted 
                                  ? 'text-green-600' 
                                  : isCurrent 
                                    ? 'text-orange-600' 
                                    : 'text-muted-foreground'
                              }>
                                {isCompleted ? '✓' : isCurrent ? '→' : ''} <NumberTicker value={grade.trainings} delay={index * 0.1} /> тренировок
                              </span>
                            </div>
                          )
                        }) || (
                          <div className="text-center py-2">
                            <span className="text-muted-foreground">Данные о грейдах загружаются...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </JaguarInteractiveCard>
            </div>
          </div>
        )}
        </div>
      </PullToRefresh>
    </div>
  )
}

export default Progress

