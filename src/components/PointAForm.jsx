import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PointAAPI } from '../services/apiService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, ArrowRight, Target, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

const PointAForm = () => {
  const { user, updateUser, isClient } = useAuth()
  const navigate = useNavigate()
  
  // Состояния формы
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  
  const totalSteps = 3

  const [formData, setFormData] = useState({
    // Physical indicators
    weight: '',
    bodyFatPercentage: '',
    plankTime: '',
    punchesPerMinute: '',
    
    // Subjective assessments (1-10 scale)
    energy: [5],
    stress: [5],
    sleep: [5],
    nutrition: [5],
    emotions: [5],
    intimacy: [5],
    
    // Goal
    pointBGoal: ''
  })

  // Загрузка существующей анкеты при монтировании
  useEffect(() => {
    const loadExistingForm = async () => {
      if (!isClient()) {
        navigate('/')
        return
      }

      try {
        setIsLoading(true)
        console.log('📋 Загружаем существующую анкету...')
        
        const existingForm = await PointAAPI.getForm()
        
        if (existingForm.form) {
          console.log('✅ Найдена существующая анкета:', existingForm.form)
          setIsEditing(true)
          
          // Преобразуем данные из API в формат компонента
          const apiForm = existingForm.form
          setFormData({
            weight: apiForm.weight || '',
            bodyFatPercentage: apiForm.bodyFatPercentage || '',
            plankTime: apiForm.plankTime || '',
            punchesPerMinute: apiForm.punchesPerMinute || '',
            energy: [apiForm.energy || 5],
            stress: [apiForm.stress || 5],
            sleep: [apiForm.sleep || 5],
            nutrition: [apiForm.nutrition || 5],
            emotions: [apiForm.emotions || 5],
            intimacy: [apiForm.intimacy || 5],
            pointBGoal: apiForm.pointBGoal || ''
          })
        } else {
          console.log('📝 Анкета не найдена, создаем новую')
          setIsEditing(false)
        }
      } catch (error) {
        if (error.status === 404) {
          console.log('📝 Анкета не найдена, создаем новую')
          setIsEditing(false)
        } else {
          console.error('❌ Ошибка загрузки анкеты:', error)
          setError('Ошибка загрузки данных: ' + error.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingForm()
  }, [isClient, navigate])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('') // Очищаем ошибку при изменении
  }

  const handleSliderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Валидация формы
  const validateForm = () => {
    const errors = []
    
    // Проверяем физические показатели
    if (formData.weight) {
      const weight = Number(formData.weight);
      if (isNaN(weight) || weight < 30 || weight > 300) {
        errors.push('Вес должен быть числом от 30 до 300 кг')
      }
    }
    
    if (formData.bodyFatPercentage) {
      const fat = Number(formData.bodyFatPercentage);
      if (isNaN(fat) || fat < 3 || fat > 50) {
        errors.push('Процент жира должен быть числом от 3 до 50%')
      }
    }
    
    if (formData.plankTime) {
      const plank = Number(formData.plankTime);
      if (isNaN(plank) || plank < 0 || plank > 3600) {
        errors.push('Время планки должно быть числом от 0 до 3600 секунд')
      }
    }
    
    if (formData.punchesPerMinute) {
      const punches = Number(formData.punchesPerMinute);
      if (isNaN(punches) || punches < 0 || punches > 500) {
        errors.push('Удары в минуту должны быть числом от 0 до 500')
      }
    }

    // Проверяем субъективные оценки (должны быть от 1 до 10)
    const subjectiveFields = ['energy', 'stress', 'sleep', 'nutrition', 'mood', 'intimacy'];
    subjectiveFields.forEach(field => {
      if (formData[field] && formData[field][0]) {
        const value = Number(formData[field][0]);
        if (isNaN(value) || value < 1 || value > 10) {
          const fieldNames = {
            energy: 'Уровень энергии',
            stress: 'Уровень стресса', 
            sleep: 'Качество сна',
            nutrition: 'Качество питания',
            mood: 'Настроение',
            intimacy: 'Интимность'
          };
          errors.push(`${fieldNames[field]} должен быть от 1 до 10`);
        }
      }
    });

    if (!formData.pointBGoal.trim()) {
      errors.push('Опишите вашу цель "Точка Б"')
    }

    return errors
  }

  // Сохранение формы
  const handleSubmit = async () => {
    console.log('🚀 Начинаем сохранение анкеты...');
    setError('')
    setSuccess('')
    
    // Валидация
    console.log('🔍 Проверяем валидацию...');
    const validationErrors = validateForm()
    console.log('📝 Данные формы:', formData);
    console.log('❗ Ошибки валидации:', validationErrors);
    
    if (validationErrors.length > 0) {
      console.log('❌ Валидация не пройдена:', validationErrors);
      setError(validationErrors.join('; '))
      return
    }

    try {
      setIsSaving(true)
      console.log('💾 Сохраняем анкету "Точка А":', formData)
      
      // Преобразуем данные в формат API (snake_case для backend)
      const apiData = {
        weight: parseFloat(formData.weight) || null,
        body_fat_percentage: parseFloat(formData.bodyFatPercentage) || null,
        plank_time: parseInt(formData.plankTime) || null,
        punches_per_minute: parseInt(formData.punchesPerMinute) || null,
        energy_level: formData.energy[0],
        stress_level: formData.stress[0],
        sleep_quality: formData.sleep[0],
        nutrition_quality: formData.nutrition[0],
        emotions_level: formData.emotions[0],
        intimacy_level: formData.intimacy[0],
        goal_description: formData.pointBGoal.trim()
      }
      
      console.log('📡 Отправляем данные на API:', apiData);
      
      const result = await PointAAPI.saveForm(apiData)
      
      console.log('✅ Анкета сохранена:', result)
      setSuccess(isEditing ? 'Анкета обновлена успешно!' : 'Анкета "Точка А" сохранена!')
      
      // Обновляем статус пользователя
      updateUser({ hasCompletedPointA: true })
      
      // Перенаправляем на главную через 2 секунды
      setTimeout(() => {
        navigate('/')
      }, 2000)
      
    } catch (error) {
      console.error('❌ Ошибка сохранения анкеты:', error)
      console.error('📄 Детали ошибки:', error.response || error.message)
      setError('Ошибка сохранения: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Если загружается
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Загрузка анкеты..." />
      </div>
    )
  }

  // Если не клиент
  if (!isClient()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Доступ к анкете "Точка А" только для клиентов
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Физические показатели</h2>
        <p className="text-muted-foreground">
          {isEditing ? 'Обновите ваши физические данные' : 'Зафиксируем вашу "Точку А"'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="weight">Вес (кг)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="75"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            min="30"
            max="300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bodyFat">Процент жира (%)</Label>
          <Input
            id="bodyFat"
            type="number"
            placeholder="18"
            value={formData.bodyFatPercentage}
            onChange={(e) => handleInputChange('bodyFatPercentage', e.target.value)}
            min="3"
            max="50"
            step="0.1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plank">Время в планке (сек)</Label>
          <Input
            id="plank"
            type="number"
            placeholder="45"
            value={formData.plankTime}
            onChange={(e) => handleInputChange('plankTime', e.target.value)}
            min="0"
            max="3600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="punches">Удары в минуту</Label>
          <Input
            id="punches"
            type="number"
            placeholder="100"
            value={formData.punchesPerMinute}
            onChange={(e) => handleInputChange('punchesPerMinute', e.target.value)}
            min="0"
            max="500"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Субъективные оценки</h2>
        <p className="text-muted-foreground">Оцените по шкале от 1 до 10</p>
      </div>

      <div className="space-y-8">
        {[
          { key: 'energy', label: 'Уровень энергии', description: '1 - крайне низкий, 10 - максимальный' },
          { key: 'stress', label: 'Уровень стресса', description: '1 - нет стресса, 10 - критический' },
          { key: 'sleep', label: 'Качество сна', description: '1 - очень плохое, 10 - отличное' },
          { key: 'nutrition', label: 'Качество питания', description: '1 - очень плохое, 10 - идеальное' },
          { key: 'emotions', label: 'Эмоциональное состояние', description: '1 - депрессия, 10 - эйфория' },
          { key: 'intimacy', label: 'Интимность', description: '1 - крайне низкая, 10 - отличная' }
        ].map(({ key, label, description }) => (
          <div key={key} className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>{label}</Label>
              <span className="text-2xl font-bold text-primary">{formData[key][0]}</span>
            </div>
            <Slider
              value={formData[key]}
              onValueChange={(value) => handleSliderChange(key, value)}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Ваша цель "Точка Б"</h2>
        <p className="text-muted-foreground">Опишите, чего вы хотите достичь</p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="goal">Подробное описание вашей цели</Label>
        <Textarea
          id="goal"
          placeholder="Например: Хочу улучшить физическую форму, снизить стресс, набрать мышечную массу, изучить техники муай тай..."
          value={formData.pointBGoal}
          onChange={(e) => handleInputChange('pointBGoal', e.target.value)}
          rows={6}
          maxLength={1000}
        />
        <p className="text-sm text-muted-foreground text-right">
          {formData.pointBGoal.length}/1000 символов
        </p>
      </div>

      {/* Предварительный просмотр */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Сводка вашей "Точки А"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {formData.weight && (
              <div>
                <strong>Вес:</strong> {formData.weight} кг
              </div>
            )}
            {formData.bodyFatPercentage && (
              <div>
                <strong>Жир:</strong> {formData.bodyFatPercentage}%
              </div>
            )}
            {formData.plankTime && (
              <div>
                <strong>Планка:</strong> {formData.plankTime} сек
              </div>
            )}
            {formData.punchesPerMinute && (
              <div>
                <strong>Удары:</strong> {formData.punchesPerMinute}/мин
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>Энергия: <strong>{formData.energy[0]}/10</strong></div>
            <div>Стресс: <strong>{formData.stress[0]}/10</strong></div>
            <div>Сон: <strong>{formData.sleep[0]}/10</strong></div>
            <div>Питание: <strong>{formData.nutrition[0]}/10</strong></div>
            <div>Эмоции: <strong>{formData.emotions[0]}/10</strong></div>
            <div>Интимность: <strong>{formData.intimacy[0]}/10</strong></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEditing ? 'Редактирование анкеты "Точка А"' : 'Анкета "Точка А"'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Обновите свои показатели' : 'Зафиксируйте ваше текущее состояние'}
          </p>
        </div>

        {/* Прогресс */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Шаг {currentStep} из {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
        </div>

        {/* Сообщения */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Контент формы */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </CardContent>
        </Card>

        {/* Навигация */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
              Далее
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Обновить' : 'Сохранить'}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Кнопка возврата */}
        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            disabled={isSaving}
          >
            Вернуться на главную
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PointAForm
