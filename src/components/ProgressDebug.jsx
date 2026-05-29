import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UsersAPI } from '../services/apiService'
import { Loader2, AlertCircle } from 'lucide-react'

const ProgressDebug = () => {
  const { user, isClient } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    const loadData = async () => {
      console.log('🔍 DEBUG: Начинаем загрузку данных Progress')
      console.log('🔍 DEBUG: user:', user)
      console.log('🔍 DEBUG: isClient:', isClient)

      try {
        setIsLoading(true)
        setError(null)

        setDebugInfo(prev => ({ ...prev, step: 'Вызов API' }))

        const response = await UsersAPI.getClientDashboard()

        console.log('🔍 DEBUG: API Response:', response)
        setDebugInfo(prev => ({ ...prev, apiResponse: response }))

        if (response && response.dashboard) {
          setDebugInfo(prev => ({ ...prev, step: 'Успешно получили данные' }))
        } else {
          throw new Error('Нет данных dashboard в ответе API')
        }

      } catch (err) {
        console.error('🔍 DEBUG: Ошибка:', err)
        setError(err.message)
        setDebugInfo(prev => ({ ...prev, error: err.message }))
      } finally {
        setIsLoading(false)
      }
    }

    if (isClient) {
      loadData()
    } else {
      console.log('🔍 DEBUG: Пользователь не является клиентом')
      setDebugInfo({ step: 'Пользователь не клиент' })
      setIsLoading(false)
    }
  }, [isClient])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Progress Debug Mode</h1>

        <div className="space-y-4">
          {/* Auth Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Информация об авторизации:</h2>
            <p>User: {user?.username || 'Не авторизован'}</p>
            <p>Role: {user?.role || 'Не определена'}</p>
            <p>Is Client: {isClient ? 'Да' : 'Нет'}</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 bg-yellow-50 rounded-lg flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Загрузка данных... {debugInfo.step}</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-600">Ошибка:</h3>
              </div>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Debug Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold mb-2">Debug информация:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Success State */}
          {!isLoading && !error && debugInfo.apiResponse && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold mb-2 text-green-700">Успешно загружено!</h2>
              <p>API вернул данные корректно.</p>
              <p>Dashboard: {debugInfo.apiResponse.dashboard ? 'Есть' : 'Нет'}</p>
              <p>Point A: {debugInfo.apiResponse.dashboard?.pointA ? 'Есть' : 'Нет'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressDebug