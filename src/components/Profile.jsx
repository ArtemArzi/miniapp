import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UsersAPI } from '../services/apiService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Building, Eye, EyeOff, Save, Loader2, AlertCircle, Settings, Trash2 } from 'lucide-react'
import MobileNavigation from './MobileNavigation'
import CacheManager from '../utils/cacheManager'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isClearingCache, setIsClearingCache] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: '',
    industry: '',
    canHelp: '',
    lookingFor: '',
    isPublic: true,
    bio: '',
    linkedIn: '',
    telegram: ''
  })

  const [stats, setStats] = useState({
    totalTrainings: 0,
    status: 'Новичок',
    joinDate: new Date().toISOString(),
    streak: 0
  })

  // Загрузка данных профиля
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        // Реальный API вызов
        const response = await UsersAPI.getUserProfile()
        
        if (response.user) {
          const userData = response.user
          const userProfile = userData.profile || {}
          
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            company: userProfile.company || '',
            industry: userProfile.industry || '',
            canHelp: userProfile.expertiseOffer || '',
            lookingFor: userProfile.expertiseSeeking || '',
            isPublic: userProfile.isPublic || false,
            bio: userProfile.bio || '',
            linkedIn: userProfile.linkedinUrl || '',
            telegram: userProfile.telegramUsername || ''
          })
          
          // Статистика из response (базовая)
          setStats({
            totalTrainings: response.stats?.totalTrainings || 0,
            status: response.stats?.currentGrade?.name || 'Новичок',
            joinDate: userData.created_at || new Date().toISOString(),
            streak: 0
          })
        }
        
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error)
        setError('Не удалось загрузить данные профиля')
        
        // Fallback с базовыми данными
        setProfileData({
          name: user?.name || '',
          email: user?.email || '',
          company: '',
          industry: '',
          canHelp: '',
          lookingFor: '',
          isPublic: false,
          bio: '',
          linkedIn: '',
          telegram: ''
        })
        
        setStats({
          totalTrainings: 0,
          status: 'Новичок',
          joinDate: new Date().toISOString(),
          streak: 0
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadProfile()
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очищаем сообщения при изменении данных
    if (successMessage) setSuccessMessage('')
    if (error) setError('')
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      setSuccessMessage('')
      
      // Реальный API вызов
      await UsersAPI.updateProfile(profileData)
      
      setIsEditing(false)
      setSuccessMessage('Профиль успешно сохранен!')
      
      // Автоматически скрываем сообщение через 3 секунды
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error)
      setError('Не удалось сохранить профиль: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
      setIsSaving(false)
    }
  }

  // Функция очистки кэша
  const handleClearCache = async () => {
    try {
      setIsClearingCache(true)
      setError('')
      setSuccessMessage('')
      
      console.log('🧹 Пользователь запросил очистку кэша')
      
      // Получаем информацию о текущем кэше
      const cacheInfo = CacheManager.getCacheInfo()
      console.log('📊 Информация о кэше перед очисткой:', cacheInfo)
      
      // Очищаем весь кэш
      const success = CacheManager.clearAllCache()
      
      if (success) {
        setSuccessMessage('Кэш успешно очищен! Данные будут обновлены.')
        
        // Автоматически скрываем сообщение и перезагружаем через 2 секунды
        setTimeout(() => {
          window.location.reload(true)
        }, 2000)
      } else {
        throw new Error('Не удалось очистить кэш')
      }
      
    } catch (error) {
      console.error('❌ Ошибка очистки кэша:', error)
      setError('Не удалось очистить кэш: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
      setIsClearingCache(false)
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Загрузка профиля...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Мой профиль</h1>
            <p className="text-muted-foreground">Управляйте своей информацией и настройками приватности</p>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            variant={isEditing ? "default" : "outline"}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </>
            ) : (
              'Редактировать'
            )}
          </Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  Ваши личные данные и контактная информация
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Компания</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Сфера деятельности</Label>
                    <Input
                      id="industry"
                      value={profileData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedIn">LinkedIn</Label>
                    <Input
                      id="linkedIn"
                      placeholder="https://linkedin.com/in/username"
                      value={profileData.linkedIn}
                      onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      placeholder="@username"
                      value={profileData.telegram}
                      onChange={(e) => handleInputChange('telegram', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">О себе</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Networking Information */}
            <Card>
              <CardHeader>
                <CardTitle>Информация для нетворкинга</CardTitle>
                <CardDescription>
                  Расскажите о своих возможностях и потребностях
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="canHelp">Могу быть полезен</Label>
                  <Textarea
                    id="canHelp"
                    placeholder="Например: Консультации по IT, инвестиции, маркетинг..."
                    value={profileData.canHelp}
                    onChange={(e) => handleInputChange('canHelp', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lookingFor">Ищу экспертизу</Label>
                  <Textarea
                    id="lookingFor"
                    placeholder="Например: Юридические услуги, дизайн, партнерство..."
                    value={profileData.lookingFor}
                    onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Настройки приватности</CardTitle>
                <CardDescription>
                  Управляйте видимостью вашего профиля
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {profileData.isPublic ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Label htmlFor="public-profile">Публичный профиль</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Другие участники клуба смогут видеть ваш профиль в разделе "Сообщество"
                    </p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={profileData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Stats and Status */}
          <div className="space-y-6">
            {/* Profile Avatar */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{profileData.name}</h3>
                  <p className="text-muted-foreground flex items-center justify-center gap-1">
                    <Building className="w-4 h-4" />
                    {profileData.company}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Training Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Статистика тренировок</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Статус</span>
                  <Badge className={getStatusColor(stats.status)}>
                    {stats.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Всего тренировок</span>
                  <span className="font-medium">{stats.totalTrainings}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Текущая серия</span>
                  <span className="font-medium">{stats.streak} дней</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">В клубе с</span>
                  <span className="font-medium">
                    {new Date(stats.joinDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Profile Visibility */}
            <Card>
              <CardHeader>
                <CardTitle>Видимость профиля</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {profileData.isPublic ? (
                      <>
                        <Eye className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Профиль публичный</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Профиль скрыт</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profileData.isPublic 
                      ? 'Ваш профиль отображается в разделе "Сообщество" и доступен для нетворкинга'
                      : 'Ваш профиль скрыт от других участников клуба'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Технические настройки
                </CardTitle>
                <CardDescription>
                  Настройки для устранения проблем
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Если вы видите устаревшие данные или список пользователей не обновляется, попробуйте очистить кэш.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCache}
                    disabled={isClearingCache}
                    className="w-full gap-2"
                  >
                    {isClearingCache ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Очистка...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Очистить кэш
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Это обновит все данные приложения
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

