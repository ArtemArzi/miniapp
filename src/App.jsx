import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Components
import Login from './components/Login'
import ClientDashboard from './components/ClientDashboard'
import CoachDashboard from './components/CoachDashboard'
import PointAForm from './components/PointAForm'
import Progress from './components/Progress'
import Community from './components/Community'
import Profile from './components/Profile'
import StudentView from './components/StudentView'
import { FullScreenLoading } from './components/LoadingSpinner'
import SwipeNavigation from './components/SwipeNavigation'
import { initializeTelegramWebApp } from './utils/telegram'

// Компонент для роутинга (внутри AuthProvider)
function AppRoutes() {
  const { isAuthenticated, user, isInitializing } = useAuth()

  // Инициализация Telegram WebApp
  useEffect(() => {
    initializeTelegramWebApp()
  }, [])

  // Показываем загрузку пока инициализируется
  if (isInitializing) {
    return <FullScreenLoading text="Проверка авторизации..." />
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <SwipeNavigation disabled={!isAuthenticated || user?.role === 'coach'}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              isAuthenticated ? (
                user?.role === 'coach' ? <CoachDashboard /> : <ClientDashboard />
              ) : (
                <Login />
              )
            } />
            <Route path="/point-a" element={<PointAForm />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/student/:studentId" element={<StudentView />} />
          </Routes>
        </SwipeNavigation>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App

// Экспорт useAuth для обратной совместимости
export { useAuth } from './contexts/AuthContext'

