import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { TextAnimate } from '@/components/ui/text-animate'
import gymInterior from '../assets/gym-interior.jpg'

const Login = () => {
  
  // Состояние для формы входа
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Состояние для формы регистрации
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'client',
    inviteCode: ''
  })
  
  const [localError, setLocalError] = useState('')
  
  const { login, register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  // Обработка формы входа
  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('🚀 handleLogin вызван!', { email, password })
    setLocalError('')
    clearError()

    // Валидация
    if (!email || !password) {
      setLocalError('Пожалуйста, заполните все поля')
      return
    }

    // Более строгая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Пожалуйста, введите корректный email')
      return
    }

    try {
      console.log('🔐 Попытка входа:', { email })
      
      // Вызываем реальный API через Auth Context
      const result = await login(email, password)
      
      if (result.success) {
        console.log('✅ Успешный вход, перенаправление...')
        navigate('/')
      } else {
        setLocalError(result.error || 'Ошибка входа')
      }
    } catch (error) {
      console.error('❌ Ошибка входа:', error)
      setLocalError('Произошла ошибка при входе')
    }
  }


  // Обработка регистрации
  const handleRegister = async (e) => {
    e.preventDefault()
    console.log('🚀 handleRegister вызван!', registerData)
    setLocalError('')
    clearError()

    // Валидация
    if (!registerData.email || !registerData.password || !registerData.name) {
      setLocalError('Пожалуйста, заполните все обязательные поля')
      return
    }

    // Более строгая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setLocalError('Пожалуйста, введите корректный email')
      return
    }

    if (registerData.password.length < 6) {
      setLocalError('Пароль должен содержать минимум 6 символов')
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setLocalError('Пароли не совпадают')
      return
    }

    // Проверка кода приглашения для тренеров
    if (registerData.role === 'coach') {
      if (!registerData.inviteCode) {
        setLocalError('Для регистрации тренера требуется код приглашения')
        return
      }
    }

    try {
      console.log('📝 Попытка регистрации:', registerData)
      
      // Вызываем API регистрации через Auth Context
      const result = await register({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        phone: registerData.phone,
        role: registerData.role,
        inviteCode: registerData.inviteCode
      })
      
      if (result.success) {
        console.log('✅ Успешная регистрация, перенаправление...')
        navigate('/')
      } else {
        setLocalError(result.error || 'Ошибка регистрации')
      }
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error)
      setLocalError('Произошла ошибка при регистрации')
    }
  }

  // Обновление данных регистрации
  const updateRegisterData = (field, value) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src={gymInterior} 
          alt="Premium Muay Thai Gym" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <TextAnimate 
              as="h1" 
              className="text-4xl font-bold mb-4"
              by="word"
              animation="slideUp"
              duration={0.5}
              delay={0.2}
            >
              JAGUAR FIGHT CLUB
            </TextAnimate>
            <TextAnimate 
              as="p" 
              className="text-xl opacity-90"
              by="word"
              animation="fadeIn"
              duration={0.4}
              delay={0.8}
            >
              Сила, Связи, Энергия
            </TextAnimate>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Добро пожаловать</CardTitle>
            <CardDescription>
              Войдите в свой личный кабинет
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Переключение между входом и регистрацией */}
            <Tabs defaultValue="login" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              {/* ФОРМА ВХОДА */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ваш@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* Пароль */}
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Пароль <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Введите пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* Кнопка входа */}
                  <ShimmerButton
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !email || !password}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Вход в систему...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </ShimmerButton>
                </form>
              </TabsContent>

              {/* ФОРМА РЕГИСТРАЦИИ */}
              <TabsContent value="register" className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">
                    📝 <strong>Создание нового аккаунта в Jaguar Fight Club</strong>
                  </p>
                </div>
                
                {/* Форма регистрации */}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="register-email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerData.email}
                        onChange={(e) => updateRegisterData('email', e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    {/* Имя */}
                    <div className="space-y-2">
                      <Label htmlFor="register-name">
                        Полное имя <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Иван Петров"
                        value={registerData.name}
                        onChange={(e) => updateRegisterData('name', e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    {/* Телефон */}
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">
                        Телефон
                      </Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+79991234567"
                        value={registerData.phone}
                        onChange={(e) => updateRegisterData('phone', e.target.value)}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">
                        Формат: +79991234567 (без пробелов и скобок)
                      </p>
                    </div>

                    {/* Роль */}
                    <div className="space-y-2">
                      <Label htmlFor="register-role">
                        Роль <span className="text-red-500">*</span>
                      </Label>
                      <Tabs value={registerData.role} onValueChange={(value) => updateRegisterData('role', value)}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="client">Клиент</TabsTrigger>
                          <TabsTrigger value="coach">Тренер</TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <p className="text-xs text-gray-500">
                        Клиент - участвует в тренировках. Тренер - проводит тренировки.
                      </p>
                    </div>

                    {/* Код приглашения для тренеров */}
                    {registerData.role === 'coach' && (
                      <div className="space-y-2">
                        <Label htmlFor="register-invite-code">
                          Код приглашения тренера <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="register-invite-code"
                          type="text"
                          placeholder="Введите код приглашения"
                          value={registerData.inviteCode}
                          onChange={(e) => updateRegisterData('inviteCode', e.target.value)}
                          disabled={isLoading}
                          required
                        />
                        <p className="text-xs text-blue-600">
                          💡 Код приглашения предоставляется администрацией клуба
                        </p>
                      </div>
                    )}

                    {/* Пароль */}
                    <div className="space-y-2">
                      <Label htmlFor="register-password">
                        Пароль <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Минимум 6 символов"
                        value={registerData.password}
                        onChange={(e) => updateRegisterData('password', e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    {/* Подтверждение пароля */}
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">
                        Подтвердите пароль <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Повторите пароль"
                        value={registerData.confirmPassword}
                        onChange={(e) => updateRegisterData('confirmPassword', e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <ShimmerButton 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    shimmerColor="#10b981"
                    background="linear-gradient(135deg, #059669 0%, #047857 100%)"
                    shimmerDuration="2s"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Регистрация...
                      </>
                    ) : (
                      'Создать аккаунт'
                    )}
                  </ShimmerButton>
                </form>

                {/* Информация о регистрации */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>
                    Создавая аккаунт, вы соглашаетесь с условиями использования Jaguar Fight Club
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Ошибки */}
            {displayError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
