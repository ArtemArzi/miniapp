// Тестовый компонент для проверки Auth Hook
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AuthTest() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    hasError,
    isClient,
    isCoach,
    isAdmin,
    logout,
    clearError 
  } = useAuth()

  return (
    <Card className="max-w-2xl mx-auto m-4">
      <CardHeader>
        <CardTitle>🔐 Auth Hook Test</CardTitle>
        <CardDescription>Проверка работы аутентификации</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Статус */}
        <div>
          <h3 className="font-semibold mb-2">Статус:</h3>
          <div className="flex gap-2 flex-wrap">
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "Авторизован" : "Не авторизован"}
            </Badge>
            {isLoading && <Badge variant="outline">Загрузка...</Badge>}
            {hasError && <Badge variant="destructive">Ошибка</Badge>}
          </div>
        </div>

        {/* Информация о пользователе */}
        {user && (
          <div>
            <h3 className="font-semibold mb-2">Пользователь:</h3>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              <p><strong>Имя:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Роль:</strong> {user.role}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
          </div>
        )}

        {/* Роли */}
        {isAuthenticated && (
          <div>
            <h3 className="font-semibold mb-2">Роли:</h3>
            <div className="flex gap-2">
              <Badge variant={isClient() ? "default" : "outline"}>Клиент</Badge>
              <Badge variant={isCoach() ? "default" : "outline"}>Тренер</Badge>
              <Badge variant={isAdmin() ? "default" : "outline"}>Админ</Badge>
            </div>
          </div>
        )}

        {/* Ошибки */}
        {error && (
          <div>
            <h3 className="font-semibold mb-2">Ошибка:</h3>
            <div className="bg-red-50 p-3 rounded-lg text-red-800">
              {error}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={clearError}
                className="ml-2"
              >
                Закрыть
              </Button>
            </div>
          </div>
        )}

        {/* Действия */}
        {isAuthenticated && (
          <div>
            <Button variant="outline" onClick={logout}>
              Выйти
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AuthTest
