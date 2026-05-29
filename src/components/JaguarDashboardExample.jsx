import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  JaguarShimmerButton,
  JaguarRippleButton,
  JaguarPulseButton,
  JaguarProgressRing,
  JaguarAnimatedCounter,
  JaguarFloatingButton,
  JaguarInteractiveCard,
  JaguarNotificationDot,
  JaguarLoadingDots
} from './ui/index';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Play,
  Pause,
  Trophy,
  Target,
  Activity,
  TrendingUp,
  Users,
  Star,
  Plus,
  Zap,
  Heart,
  Calendar,
  Clock,
  Award
} from 'lucide-react';

const JaguarDashboardExample = () => {
  const { user } = useAuth();
  const [isTraining, setIsTraining] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    weeklyProgress: 75,
    totalWorkouts: 127,
    currentStreak: 12,
    level: 8,
    notifications: 3,
    achievements: 15,
    nextGoal: 85
  });
  const [isLoading, setIsLoading] = useState(false);

  // Симуляция загрузки данных
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartTraining = () => {
    setIsTraining(!isTraining);
    // Здесь логика начала/остановки тренировки
  };

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`);
    // Здесь обработка быстрых действий
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <JaguarLoadingDots variant="primary" size="lg" />
          <p className="text-muted-foreground">Loading your training data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Fighter'}!</h1>
            <p className="text-white/80">Ready to dominate today's training?</p>
          </div>
          <div className="relative">
            <Users className="w-6 h-6" />
            <JaguarNotificationDot
              count={dashboardData.notifications}
              variant="accent"
              size="sm"
              className="absolute -top-1 -right-1"
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 pb-24">
        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <JaguarPulseButton
              variant="primary"
              size="lg"
              intensity={isTraining ? "strong" : "medium"}
              className="w-full"
              onClick={handleStartTraining}
            >
              {isTraining ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isTraining ? "Pause Training" : "Start Training"}
            </JaguarPulseButton>

            <JaguarShimmerButton
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => handleQuickAction('plan')}
            >
              <Calendar className="w-5 h-5" />
              View Plan
            </JaguarShimmerButton>

            <JaguarRippleButton
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => handleQuickAction('progress')}
            >
              <TrendingUp className="w-5 h-5" />
              Track Progress
            </JaguarRippleButton>
          </div>
        </section>

        {/* Progress Overview */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">This Week's Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Weekly Progress Ring */}
            <div className="text-center">
              <JaguarProgressRing
                progress={dashboardData.weeklyProgress}
                variant="primary"
                size={120}
                animated={true}
                showText={true}
              />
              <p className="text-sm text-muted-foreground mt-2">Weekly Goal</p>
            </div>

            {/* Stats Cards */}
            <JaguarInteractiveCard className="p-4 text-center">
              <Trophy className="w-8 h-8 text-[#FFD93D] mx-auto mb-2" />
              <JaguarAnimatedCounter
                value={dashboardData.totalWorkouts}
                variant="accent"
                size="lg"
                className="block"
              />
              <p className="text-sm text-muted-foreground">Total Workouts</p>
            </JaguarInteractiveCard>

            <JaguarInteractiveCard className="p-4 text-center">
              <Target className="w-8 h-8 text-[#6BCF7F] mx-auto mb-2" />
              <JaguarAnimatedCounter
                value={dashboardData.currentStreak}
                suffix=" days"
                variant="success"
                size="lg"
                className="block"
              />
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </JaguarInteractiveCard>

            <JaguarInteractiveCard className="p-4 text-center">
              <Award className="w-8 h-8 text-[#4ECDC4] mx-auto mb-2" />
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold text-[#4ECDC4]">Level</span>
                <JaguarAnimatedCounter
                  value={dashboardData.level}
                  variant="secondary"
                  size="lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">Fighter Level</p>
            </JaguarInteractiveCard>
          </div>
        </section>

        {/* Interactive Dashboard Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Training Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <JaguarInteractiveCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Activity className="w-8 h-8 text-[#FF6B35]" />
                  <div>
                    <h3 className="font-semibold">Today's Session</h3>
                    <p className="text-sm text-muted-foreground">Muay Thai Fundamentals</p>
                  </div>
                </div>
                <Badge variant="secondary">45 min</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>3/5 exercises</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B35] transition-all duration-500 rounded-full"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            </JaguarInteractiveCard>

            <JaguarInteractiveCard className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <Star className="w-8 h-8 text-[#FFD93D]" />
                  <JaguarNotificationDot
                    count={dashboardData.achievements}
                    variant="accent"
                    size="sm"
                    className="absolute -top-1 -right-1"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">Achievements</h3>
                  <p className="text-sm text-muted-foreground">Recent unlocks</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">New</Badge>
                  <span className="text-sm">Perfect Form Master</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">New</Badge>
                  <span className="text-sm">10-Day Streak</span>
                </div>
              </div>
            </JaguarInteractiveCard>

            <JaguarInteractiveCard className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-8 h-8 text-[#4ECDC4]" />
                <div>
                  <h3 className="font-semibold">Next Goal</h3>
                  <p className="text-sm text-muted-foreground">Weekly target</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <JaguarAnimatedCounter
                    value={dashboardData.nextGoal}
                    suffix="%"
                    variant="secondary"
                    size="md"
                  />
                  <p className="text-xs text-muted-foreground">to weekly goal</p>
                </div>
                <JaguarRippleButton
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => handleQuickAction('boost')}
                >
                  <Zap className="w-4 h-4" />
                  Boost Progress
                </JaguarRippleButton>
              </div>
            </JaguarInteractiveCard>
          </div>
        </section>

        {/* Community Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Community</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Training Partners</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <JaguarInteractiveCard className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">MK</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Mike Chen</p>
                      <p className="text-sm text-muted-foreground">15-day streak</p>
                    </div>
                    <JaguarRippleButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('challenge')}
                    >
                      Challenge
                    </JaguarRippleButton>
                  </div>
                </JaguarInteractiveCard>

                <JaguarInteractiveCard className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FFD93D] to-[#FFC107] rounded-full flex items-center justify-center">
                      <span className="text-black font-semibold">AS</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Anna Smith</p>
                      <p className="text-sm text-muted-foreground">Level 12 Fighter</p>
                    </div>
                    <JaguarRippleButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('message')}
                    >
                      Message
                    </JaguarRippleButton>
                  </div>
                </JaguarInteractiveCard>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Floating Action Buttons */}
      <JaguarFloatingButton
        icon={<Plus className="w-6 h-6" />}
        label="Log New Workout"
        variant="primary"
        size="lg"
        position="bottom-right"
        onClick={() => handleQuickAction('log-workout')}
      />

      <JaguarFloatingButton
        icon={<Heart className="w-5 h-5" />}
        label="Motivation"
        variant="secondary"
        size="md"
        position="bottom-left"
        onClick={() => handleQuickAction('motivation')}
      />
    </div>
  );
};

export default JaguarDashboardExample;