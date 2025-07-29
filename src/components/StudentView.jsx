import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UsersAPI, CommentsAPI, PointAAPI, TrainingsAPI, TokenService } from '../services/apiService'

// Функция для расчета прогресса ученика (та же формула что в Progress.jsx)
const calculateProgressForStudent = (pointAData, currentData) => {
  if (!pointAData || !currentData) return 0
  
  // Субъективные показатели от 1 до 10
  const subjectiveFields = [
    { pointA: pointAData.energy, current: currentData.energy_level },
    { pointA: pointAData.stress, current: currentData.stress_level, inverted: true },
    { pointA: pointAData.sleep, current: currentData.sleep_quality },
    { pointA: pointAData.nutrition, current: currentData.nutrition_quality },
    { pointA: pointAData.emotions, current: currentData.emotions_level },
    { pointA: pointAData.intimacy, current: currentData.intimacy_level }
  ]
  
  let totalPointA = 0
  let totalCurrent = 0
  let count = 0
  
  subjectiveFields.forEach(({ pointA, current, inverted }) => {
    if (pointA && current) {
      // Для стресса инвертируем (меньше стресс = лучше)
      if (inverted) {
        totalPointA += (11 - pointA)
        totalCurrent += (11 - current)
      } else {
        totalPointA += pointA
        totalCurrent += current
      }
      count++
    }
  })
  
  if (count === 0) return 0
  
  const avgPointA = totalPointA / count
  const avgCurrent = totalCurrent / count
  
  // Формула из ТЗ: (Среднее текущее - Среднее А) / (10 - Среднее А) * 100
  const progress = ((avgCurrent - avgPointA) / (10 - avgPointA)) * 100
  
  return Math.max(0, Math.min(100, Math.round(progress * 100) / 100))
}
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, MessageSquare, Target, TrendingUp, Calendar, Send, Loader2, AlertCircle, Dumbbell, Plus } from 'lucide-react'
import MobileNavigation from './MobileNavigation'
import { JaguarShimmerButton, JaguarProgressRing, JaguarRippleButton, JaguarAnimatedCounter, JaguarPulseButton } from '@/components/ui'

const StudentView = () => {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Состояния для формы тренировки
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [isSavingTraining, setIsSavingTraining] = useState(false)
  const [trainingForm, setTrainingForm] = useState({
    trainingDate: new Date().toISOString().split('T')[0], // Сегодняшняя дата
    trainingType: 'Общая',
    attended: true
  })

  const [student, setStudent] = useState(null)
  const [comments, setComments] = useState([])
  const [pointAData, setPointAData] = useState(null)
  const [showAllComments, setShowAllComments] = useState(false)
  const [commentsPagination, setCommentsPagination] = useState(null)

  // Загрузка данных студента
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        // Параллельно загружаем данные студента, комментарии и анкету
        const [studentResponse, commentsResponse, pointAResponse] = await Promise.allSettled([
          UsersAPI.getUserById(studentId),
          CommentsAPI.getCommentsByUserId(studentId, { all: showAllComments }),
          PointAAPI.getFormByUserId(studentId)
        ])
        
        // Обработка данных студента
        if (studentResponse.status === 'fulfilled' && studentResponse.value.user) {
          const { user, stats } = studentResponse.value
          
          // Форматируем дату последней тренировки
          let formattedLastTraining = 'Нет тренировок'
          if (stats?.lastTraining) {
            const lastDate = new Date(stats.lastTraining)
            const today = new Date()
            const diffDays = Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24))
            
            if (diffDays === 0) {
              formattedLastTraining = 'Сегодня'
            } else if (diffDays === 1) {
              formattedLastTraining = 'Вчера'
            } else if (diffDays < 7) {
              formattedLastTraining = `${diffDays} дня назад`
            } else {
              formattedLastTraining = lastDate.toLocaleDateString('ru-RU')
            }
          }
          
          // Объединяем user и stats
          setStudent({
            ...user,
            totalTrainings: stats?.totalTrainings || 0,
            lastTraining: formattedLastTraining,
            grade: stats?.currentGrade || { name: 'Новичок', emoji: '🥊' },
            joinDate: user.createdAt,
            hasCompletedPointA: stats?.hasCompletedPointA || false
          })
        } else {
          // Fallback с mock данными
          setStudent({
            id: parseInt(studentId),
            name: 'Александр Петров',
            email: 'alex@example.com',
            grade: { name: 'Новичок', emoji: '🥊' },
            totalTrainings: 5,
            joinDate: '2024-01-01',
            lastTraining: '2 дня назад'
          })
        }
        
        // Обработка комментариев
        if (commentsResponse.status === 'fulfilled' && commentsResponse.value.comments) {
          setComments(commentsResponse.value.comments)
          setCommentsPagination(commentsResponse.value.pagination)
        } else {
          // Fallback с mock данными
          setComments([
            {
              id: 1,
              date: '2024-01-15',
              comment: 'Отличная работа сегодня! Техника ударов значительно улучшилась. Продолжайте работать над скоростью комбинаций.',
              training: 'Техника ударов',
              attended: true
            },
            {
              id: 2,
              date: '2024-01-13',
              comment: 'Хорошая выносливость. Заметен прогресс в кардио. Рекомендую добавить больше работы с тяжелым мешком.',
              training: 'Кардио тренировка',
              attended: true
            }
          ])
        }
        
        // Обработка анкеты Point A
        if (pointAResponse.status === 'fulfilled' && pointAResponse.value.form) {
          const form = pointAResponse.value.form
          
          // Получаем последние показатели прогресса ученика
          try {
            const token = TokenService.getToken()
            console.log('🔐 Токен тренера:', token ? token.substring(0, 50) + '...' : 'отсутствует')
            console.log('👤 Текущий пользователь:', user)
            console.log('🔍 localStorage содержимое:', localStorage.getItem('jaguar_token'))
            console.log('📡 Запрос к API:', `/api/progress/latest/${studentId}`)
            
            const progressResponse = await fetch(`/api/progress/latest/${studentId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            
            console.log('📊 Ответ API:', progressResponse.status, progressResponse.statusText)
            
            let currentData = null
            let calculatedProgress = 0
            
            if (progressResponse.ok) {
              const progressData = await progressResponse.json()
              currentData = progressData.latestProgress
              
              // Рассчитываем прогресс если есть данные
              if (currentData && form) {
                calculatedProgress = calculateProgressForStudent(form, currentData)
              }
            }
            
            setPointAData({
              pointBGoal: form.pointBGoal || 'Цель не указана',
              currentProgress: calculatedProgress, // Реальный расчет
              pointA: {
                weight: form.weight || 0,
                bodyFatPercentage: form.bodyFatPercentage || 0,
                plankTime: form.plankTime || 0,
                punchesPerMinute: form.punchesPerMinute || 0,
                energy: form.energy || 0,
                stress: form.stress || 0,
                sleep: form.sleep || 0,
                nutrition: form.nutrition || 0
              },
              current: currentData ? {
                weight: currentData.weight || 0,
                bodyFatPercentage: currentData.body_fat_percentage || 0,
                plankTime: currentData.plank_time || 0,
                punchesPerMinute: currentData.punches_per_minute || 0,
                energy: currentData.energy_level || 0,
                stress: currentData.stress_level || 0,
                sleep: currentData.sleep_quality || 0,
                nutrition: currentData.nutrition_quality || 0
              } : null
            })
          } catch (error) {
            console.error('Ошибка получения данных прогресса:', error)
            // Fallback с реальными данными только из Point A
            setPointAData({
              pointBGoal: form.pointBGoal || 'Цель не указана',
              currentProgress: 0,
              pointA: {
                weight: form.weight || 0,
                bodyFatPercentage: form.bodyFatPercentage || 0,
                plankTime: form.plankTime || 0,
                punchesPerMinute: form.punchesPerMinute || 0,
                energy: form.energy || 0,
                stress: form.stress || 0,
                sleep: form.sleep || 0,
                nutrition: form.nutrition || 0
              },
              current: null
            })
          }
        } else {
          // Fallback с mock данными
          setPointAData({
            pointBGoal: 'Хочу улучшить физическую форму, снизить уровень стресса, освоить технику Muay Thai и найти единомышленников для бизнес-нетворкинга',
            currentProgress: 75,
            pointA: {
              weight: 75,
              bodyFatPercentage: 18,
              plankTime: 45,
              punchesPerMinute: 100,
              energy: 6,
              stress: 7,
              sleep: 5,
              nutrition: 6
            },
            current: {
              weight: 73,
              bodyFatPercentage: 15,
              plankTime: 75,
              punchesPerMinute: 130,
              energy: 8,
              stress: 4,
              sleep: 8,
              nutrition: 8
            }
          })
        }
        
      } catch (error) {
        console.error('Ошибка загрузки данных студента:', error)
        setError('Не удалось загрузить данные студента')
      } finally {
        setIsLoading(false)
      }
    }

    if (studentId) {
      loadStudentData()
    }
  }, [studentId, showAllComments])

  // Функция для переключения отображения всех комментариев
  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setIsSavingComment(true)
      setError('')
      setSuccessMessage('')
      
      // Создаем новый комментарий для API
      const commentData = {
        userId: parseInt(studentId),
        comment: newComment,
        trainingType: 'Тренировка'
      }
      
      // Пытаемся сохранить через API
      const response = await CommentsAPI.addComment(commentData)
      
      if (response.comment) {
        // Добавляем новый комментарий в правильном формате
        const newCommentFormatted = {
          id: response.comment.id,
          comment: response.comment.comment,
          isRead: 1,
          createdAt: response.comment.createdAt,
          trainingType: response.comment.trainingType,
          trainingDate: new Date().toISOString().split('T')[0],
          coachName: user?.name || 'Тренер',
          coachEmail: user?.email || ''
        }
        setComments([newCommentFormatted, ...comments])
      } else {
        throw new Error('Не удалось сохранить комментарий')
      }
      
      setNewComment('')
      setSuccessMessage('Комментарий добавлен!')
      
      // Автоматически скрываем сообщение через 3 секунды
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (error) {
      console.error('Ошибка добавления комментария:', error)
      setError('Не удалось добавить комментарий')
    } finally {
      setIsSavingComment(false)
    }
  }

  // Добавление тренировки
  const handleAddTraining = async () => {
    try {
      setIsSavingTraining(true)
      setError('')
      setSuccessMessage('')
      
      const trainingData = {
        clientId: parseInt(studentId),
        trainingDate: trainingForm.trainingDate,
        trainingType: trainingForm.trainingType,
        attended: trainingForm.attended
      }
      
      const response = await TrainingsAPI.addTraining(trainingData)
      
      if (response.success) {
        // Обновляем данные студента с новой статистикой и грейдом
        setStudent(prev => ({
          ...prev,
          totalTrainings: response.clientStats?.totalTrainings || (prev.totalTrainings || 0) + 1,
          lastTraining: new Date(trainingForm.trainingDate).toLocaleDateString('ru-RU'),
          grade: response.clientStats?.grade || prev.grade
        }))
        
        // Сбрасываем форму
        setTrainingForm({
          trainingDate: new Date().toISOString().split('T')[0],
          trainingType: 'Общая',
          attended: true
        })
        
        setShowTrainingForm(false)
        setSuccessMessage('Тренировка успешно добавлена!')
        
        // Автоматически скрываем сообщение через 3 секунды
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        throw new Error(response.message || 'Не удалось добавить тренировку')
      }
      
    } catch (error) {
      console.error('Ошибка добавления тренировки:', error)
      setError('Не удалось добавить тренировку: ' + error.message)
    } finally {
      setIsSavingTraining(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Новичок': return 'bg-blue-100 text-blue-800'
      case 'Боец': return 'bg-green-100 text-green-800'
      case 'Воин': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNavigation />
        <div className="container mx-auto mobile-container mobile-scroll-container px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Загрузка данных студента...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Если нет данных студента
  if (!student) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNavigation />
        <div className="container mx-auto mobile-container mobile-scroll-container px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Студент не найден</h2>
            <p className="text-muted-foreground mb-4">Студент с ID {studentId} не найден или у вас нет прав доступа</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      
      <div className="container mx-auto mobile-container mobile-scroll-container px-4 py-8">
        {/* Header - мобильная адаптация */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/')} size="sm" className="flex-shrink-0">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Назад к ученикам</span>
            </Button>
            <Badge className={`${getStatusColor(student.grade?.name || student.status)} flex-shrink-0`}>
              {student.grade?.emoji || ''} {student.grade?.name || student.status}
            </Badge>
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">{student.email}</p>
          </div>
        </div>
        
        {/* Сообщения об ошибках и успехе */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Student Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Цель ученика ("Точка Б")
                </CardTitle>
                <CardDescription>
                  Что хочет достичь ученик
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{pointAData?.pointBGoal || 'Цель не указана'}</p>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Прогресс к цели</span>
                    <span className="text-sm font-medium">{pointAData?.currentProgress || 0}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={pointAData?.currentProgress || 0} className="h-2" />
                    <div className="flex justify-center mt-2">
                      <JaguarProgressRing 
                        progress={pointAData?.currentProgress || 0}
                        size={60}
                        strokeWidth={4}
                        className="absolute -top-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Comparison - мобильная адаптация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  Прогресс показателей
                </CardTitle>
                <CardDescription className="text-sm">
                  Сравнение "Точки А" с текущими результатами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: 'Вес', pointA: pointAData?.pointA?.weight || 75, current: pointAData?.current?.weight || 73, unit: 'кг', better: 'lower' },
                    { label: 'Жир', pointA: pointAData?.pointA?.bodyFatPercentage || 18, current: pointAData?.current?.bodyFatPercentage || 15, unit: '%', better: 'lower' },
                    { label: 'Планка', pointA: pointAData?.pointA?.plankTime || 45, current: pointAData?.current?.plankTime || 75, unit: 'сек', better: 'higher' },
                    { label: 'Удары/мин', pointA: pointAData?.pointA?.punchesPerMinute || 100, current: pointAData?.current?.punchesPerMinute || 130, unit: '', better: 'higher' },
                    { label: 'Энергия', pointA: pointAData?.pointA?.energy || 6, current: pointAData?.current?.energy || 8, unit: '/10', better: 'higher' },
                    { label: 'Стресс', pointA: pointAData?.pointA?.stress || 7, current: pointAData?.current?.stress || 4, unit: '/10', better: 'lower' },
                    { label: 'Сон', pointA: pointAData?.pointA?.sleep || 5, current: pointAData?.current?.sleep || 8, unit: '/10', better: 'higher' },
                    { label: 'Питание', pointA: pointAData?.pointA?.nutrition || 6, current: pointAData?.current?.nutrition || 8, unit: '/10', better: 'higher' }
                  ].map((metric) => {
                    const isImproved = metric.better === 'higher' 
                      ? metric.current > metric.pointA 
                      : metric.current < metric.pointA
                    
                    return (
                      <div key={metric.label} className="p-2 sm:p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm font-medium">{metric.label}</span>
                          {isImproved && <Badge variant="secondary" className="text-xs py-0 px-1">✓</Badge>}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground">Было:</span>
                            <span>{metric.pointA}{metric.unit}</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground">Сейчас:</span>
                            <span className={`font-medium ${isImproved ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {metric.current}{metric.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Add New Comment - мобильная адаптация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  Добавить комментарий
                </CardTitle>
                <CardDescription className="text-sm">
                  Оставьте обратную связь после тренировки
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Textarea
                  placeholder="Опишите как прошла тренировка, что удалось хорошо, над чем стоит поработать..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Ученик получит уведомление о новом комментарии
                  </p>
                  <JaguarShimmerButton
                    variant="primary"
                    size="sm"
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || isSavingComment}
                    className="w-full sm:w-auto"
                  >
                    {isSavingComment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить
                      </>
                    )}
                  </JaguarShimmerButton>
                </div>
              </CardContent>
            </Card>

            {/* Add Training Form - мобильная адаптация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
                  Добавить тренировку
                </CardTitle>
                <CardDescription className="text-sm">
                  Отметьте проведенную тренировку и оставьте комментарий
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showTrainingForm ? (
                  <JaguarPulseButton
                    variant="success"
                    size="sm"
                    onClick={() => setShowTrainingForm(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить тренировку
                  </JaguarPulseButton>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Дата тренировки */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="training-date" className="text-sm">Дата тренировки</Label>
                      <Input
                        id="training-date"
                        type="date"
                        value={trainingForm.trainingDate}
                        onChange={(e) => setTrainingForm(prev => ({
                          ...prev,
                          trainingDate: e.target.value
                        }))}
                        className="text-sm h-9"
                      />
                    </div>

                    {/* Тип тренировки */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="training-type" className="text-sm">Тип тренировки</Label>
                      <Select
                        value={trainingForm.trainingType}
                        onValueChange={(value) => setTrainingForm(prev => ({
                          ...prev,
                          trainingType: value
                        }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Выберите тип тренировки" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Общая">Общая</SelectItem>
                          <SelectItem value="Техника">Техника</SelectItem>
                          <SelectItem value="Кардио">Кардио</SelectItem>
                          <SelectItem value="Спарринг">Спарринг</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Посещение */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="attended"
                        checked={trainingForm.attended}
                        onCheckedChange={(checked) => setTrainingForm(prev => ({
                          ...prev,
                          attended: checked
                        }))}
                      />
                      <Label htmlFor="attended" className="text-sm leading-relaxed">Клиент присутствовал на тренировке</Label>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <JaguarShimmerButton
                        variant="success"
                        size="sm"
                        onClick={handleAddTraining}
                        disabled={isSavingTraining}
                        className="flex-1"
                      >
                        {isSavingTraining ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Dumbbell className="w-4 h-4 mr-2" />
                            Сохранить тренировку
                          </>
                        )}
                      </JaguarShimmerButton>
                      <JaguarRippleButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowTrainingForm(false)}
                        disabled={isSavingTraining}
                        className="sm:w-auto"
                      >
                        Отмена
                      </JaguarRippleButton>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - мобильная адаптация */}
          <div className="space-y-4 sm:space-y-6">
            {/* Student Stats - мобильная адаптация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Всего тренировок</span>
                  <JaguarAnimatedCounter 
                    value={student.totalTrainings} 
                    className="font-medium text-sm sm:text-base"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Последняя тренировка</span>
                  <span className="font-medium text-sm sm:text-base">{student.lastTraining}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">В клубе с</span>
                  <span className="font-medium text-sm sm:text-base">
                    {student.joinDate ? 
                      new Date(student.joinDate).toLocaleDateString('ru-RU') : 
                      'Не указано'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Статус</span>
                  <Badge className={`${getStatusColor(student.grade?.name || student.status)} text-xs`}>
                    {student.grade?.emoji || ''} {student.grade?.name || student.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Comments History - мобильная адаптация */}
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    История комментариев
                  </CardTitle>
                  {commentsPagination && commentsPagination.total > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleShowAllComments}
                      className="text-xs w-full sm:w-auto justify-start sm:justify-center"
                    >
                      {showAllComments ? 'Показать последние 3' : `Показать все (${commentsPagination.total})`}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {comments.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                    Комментариев пока нет
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 sm:border-l-4 border-primary pl-2 sm:pl-4 pb-3 sm:pb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt || comment.date).toLocaleDateString('ru-RU')}
                        </span>
                        <Badge variant="secondary" className="text-xs py-0 px-1 self-start">
                          {comment.coachName || comment.trainer || 'Тренер'}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-xs sm:text-sm mb-1">{comment.trainingType || comment.training || 'Тренировка'}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{comment.comment}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentView

