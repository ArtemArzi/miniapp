import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UsersAPI } from '../services/apiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Search, Building, Briefcase, MessageCircle, Loader2, AlertCircle, RefreshCw, Send } from 'lucide-react'
import MobileNavigation from './MobileNavigation'
import { useTelegram } from '../utils/telegram'

const Community = () => {
  const { user, isAuthenticated } = useAuth()
  const telegram = useTelegram()
  const [searchTerm, setSearchTerm] = useState('')
  
  // API состояние
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Загрузка участников сообщества
  const loadCommunityMembers = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      console.log('🏘️ Загрузка участников сообщества...')
      
      const params = {}
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      
      const response = await UsersAPI.getCommunityMembers(params)
      console.log('✅ Участники сообщества загружены:', response.members.length)
      
      // Преобразуем данные для компонента
      const transformedMembers = response.members.map(member => ({
        id: member.id,
        name: member.name,
        company: member.company || 'Не указано',
        industry: member.industry || 'Не указано',
        status: member.grade?.name || 'Новичок',
        statusEmoji: member.grade?.emoji || '🥊',
        trainings: member.totalTrainings || 0,
        canHelp: member.canHelp || 'Не указано',
        lookingFor: member.lookingFor || 'Не указано',
        isPublic: member.isPublic,
        avatar: member.avatar,
        linkedinUrl: member.linkedinUrl,
        telegramUsername: member.telegramUsername
      }))
      
      setMembers(transformedMembers)
      
    } catch (error) {
      console.error('❌ Ошибка загрузки участников сообщества:', error)
      setError(error.message || 'Ошибка загрузки участников сообщества')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Загрузка при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      loadCommunityMembers()
    }
  }, [isAuthenticated])

  // Поиск с задержкой
  useEffect(() => {
    if (!isAuthenticated) return
    
    const timeoutId = setTimeout(() => {
      loadCommunityMembers()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, isAuthenticated])

  // Обновление списка
  const handleRefresh = () => {
    loadCommunityMembers(true)
  }

  // Функция для открытия Telegram чата
  const handleTelegramContact = (member) => {
    if (!member.telegramUsername) {
      // Если Telegram WebApp доступен, используем его уведомления
      if (telegram.isWebApp) {
        telegram.notifications.showAlert('У участника не указан Telegram username')
      } else {
        alert('У участника не указан Telegram username')
      }
      return
    }

    try {
      // Очищаем username от символа @ если он есть
      const cleanUsername = member.telegramUsername.replace(/^@/, '')
      const telegramUrl = `https://t.me/${cleanUsername}`
      
      console.log(`🔗 Открываем Telegram чат с ${member.name}: ${telegramUrl}`)
      
      // Если в Telegram WebApp - используем нативный API
      if (telegram.isWebApp) {
        telegram.data.openTelegramLink(telegramUrl)
        
        // Показываем подтверждение
        telegram.notifications.showAlert(
          `Открывается чат с ${member.name} в Telegram`
        )
      } else {
        // Fallback для обычного браузера
        window.open(telegramUrl, '_blank')
      }
    } catch (error) {
      console.error('Ошибка открытия Telegram чата:', error)
      
      if (telegram.isWebApp) {
        telegram.notifications.showAlert('Ошибка при открытии Telegram')
      } else {
        alert('Ошибка при открытии Telegram')
      }
    }
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

  // Проверка доступа
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNavigation />
        <div className="container mx-auto mobile-container mobile-scroll-container px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Войдите в систему, чтобы получить доступ к сообществу
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      
      <div className="container mx-auto mobile-container mobile-scroll-container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Сообщество клуба</h1>
          <p className="text-muted-foreground">Знакомьтесь и налаживайте связи с единомышленниками</p>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск по имени, компании, экспертизе..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{members.length} участников</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading && !isRefreshing && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Загрузка участников сообщества...</span>
          </div>
        )}

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

        {/* Members Grid */}
        {!isLoading && members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center relative">
                      <span className="font-medium text-primary">{member.avatar}</span>
                      {member.telegramUsername && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Send className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {member.name}
                        {member.telegramUsername && (
                          <Badge variant="secondary" className="text-xs">
                            <Send className="w-3 h-3 mr-1" />
                            Telegram
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {member.company}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span>{member.industry}</span>
                  <span>•</span>
                  <span>{member.trainings} тренировок</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-1">Могу быть полезен:</h4>
                    <p className="text-sm text-muted-foreground">{member.canHelp}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-blue-700 mb-1">Ищу экспертизу:</h4>
                    <p className="text-sm text-muted-foreground">{member.lookingFor}</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => handleTelegramContact(member)}
                  disabled={!member.telegramUsername}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {member.telegramUsername ? 'Написать в Telegram' : 'Telegram недоступен'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && members.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Участники не найдены</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'Пока нет участников в сообществе'}
            </p>
          </div>
        )}

        {/* Community Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Правила сообщества</CardTitle>
            <CardDescription>
              Для создания комфортной среды для нетворкинга
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">✅ Приветствуется:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Взаимопомощь и обмен опытом</li>
                  <li>• Профессиональное общение</li>
                  <li>• Предложения о сотрудничестве</li>
                  <li>• Обмен контактами для бизнеса</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">❌ Не допускается:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Спам и навязчивая реклама</li>
                  <li>• Неуважительное поведение</li>
                  <li>• Разглашение личной информации</li>
                  <li>• Обсуждение политики и религии</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Community

