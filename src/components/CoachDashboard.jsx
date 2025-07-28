import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UsersAPI } from '../services/apiService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, User, MessageSquare, TrendingUp, LogOut, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import MobileNavigation from './MobileNavigation'

const CoachDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  
  // API состояние
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Загрузка списка клиентов
  const loadStudents = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      console.log('🔍 Загрузка списка клиентов для тренера...')
      
      const response = await UsersAPI.getUsers('client')
      console.log('✅ Список клиентов загружен:', response.users.length)
      
      // Преобразуем данные для компонента
      const transformedStudents = response.users.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        totalTrainings: client.totalTrainings || 0,
        lastTraining: formatLastTraining(client.lastTraining),
        status: client.grade?.name || 'Новичок',
        statusEmoji: client.grade?.emoji || '🥊',
        progress: calculateProgress(client.totalTrainings),
        hasUnreadComments: (client.unreadComments || 0) > 0,
        unreadCommentsCount: client.unreadComments || 0,
        hasCompletedPointA: client.hasCompletedPointA
      }))
      
      setStudents(transformedStudents)
      
    } catch (error) {
      console.error('❌ Ошибка загрузки клиентов:', error)
      setError(error.message || 'Ошибка загрузки списка клиентов')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Загрузка при монтировании компонента
  useEffect(() => {
    loadStudents()
  }, [])

  // Форматирование даты последней тренировки
  const formatLastTraining = (dateString) => {
    if (!dateString) return 'Никогда'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays <= 7) return `${diffDays} дней назад`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} недель назад`
    return `${Math.ceil(diffDays / 30)} месяцев назад`
  }

  // Расчет прогресса (простая формула на основе тренировок)
  const calculateProgress = (trainings) => {
    // Прогресс до следующего грейда
    const gradeThresholds = [0, 10, 25, 50, 75, 100]
    let currentLevel = 0
    
    for (let i = gradeThresholds.length - 1; i >= 0; i--) {
      if (trainings >= gradeThresholds[i]) {
        currentLevel = i
        break
      }
    }
    
    if (currentLevel === gradeThresholds.length - 1) return 100
    
    const currentThreshold = gradeThresholds[currentLevel]
    const nextThreshold = gradeThresholds[currentLevel + 1]
    const progress = ((trainings - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    
    return Math.min(Math.round(progress), 100)
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Новичок': return 'bg-gray-100 text-gray-800'
      case 'Детёныш': return 'bg-blue-100 text-blue-800'
      case 'Охотник': return 'bg-green-100 text-green-800'
      case 'Хищник': return 'bg-orange-100 text-orange-800'
      case 'Альфа': return 'bg-purple-100 text-purple-800'
      case 'Король джунглей': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Обновление списка
  const handleRefresh = () => {
    loadStudents(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      
      <div className="container mx-auto mobile-container mobile-scroll-container px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Панель тренера</h1>
            <p className="text-muted-foreground">Добро пожаловать, {user?.name}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
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
            <span className="ml-2">Загрузка списка клиентов...</span>
          </div>
        )}

        {/* Stats Overview */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего учеников</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активных сегодня</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.filter(s => s.lastTraining === 'Сегодня').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Требуют внимания</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.filter(s => s.hasUnreadComments || !s.hasCompletedPointA).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Средний прогресс</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Students List */}
        {!isLoading && !error && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Ваши ученики ({students.length})</CardTitle>
                  <CardDescription>
                    Управляйте прогрессом и оставляйте комментарии
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Поиск учеников..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">
                    {searchTerm ? 'Ученики не найдены' : 'Нет учеников'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? `По запросу "${searchTerm}" ничего не найдено`
                      : 'У вас пока нет учеников в системе'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center relative">
                          <User className="w-5 h-5 text-primary" />
                          {!student.hasCompletedPointA && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white" 
                                 title="Не заполнена анкета 'Точка А'" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium flex items-center space-x-2">
                            <span>{student.name}</span>
                            {student.statusEmoji && (
                              <span className="text-lg">{student.statusEmoji}</span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{student.totalTrainings}</p>
                          <p className="text-xs text-muted-foreground">тренировок</p>
                        </div>

                        <div className="text-center min-w-[80px]">
                          <p className="text-sm font-medium">{student.lastTraining}</p>
                          <p className="text-xs text-muted-foreground">последняя</p>
                        </div>

                        <div className="text-center min-w-[60px]">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{student.progress}%</p>
                        </div>

                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>

                        <div className="flex items-center space-x-2">
                          {student.hasUnreadComments && (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                              <span className="text-xs text-red-600">{student.unreadCommentsCount}</span>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/student/${student.id}`)}
                          >
                            Открыть
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CoachDashboard

