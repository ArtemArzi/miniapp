// Компонент загрузки для JAGUAR FIGHT CLUB
import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ size = 'md', text = 'Загрузка...' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  )
}

export function FullScreenLoading({ text = 'Инициализация...' }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🦁</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">JAGUAR FIGHT CLUB</h2>
          <p className="text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
