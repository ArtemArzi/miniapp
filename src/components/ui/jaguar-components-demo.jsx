"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { JaguarShimmerButton } from "./jaguar-shimmer-button";
import { JaguarRippleButton } from "./jaguar-ripple-button";
import { JaguarPulseButton } from "./jaguar-pulse-button";
import { JaguarProgressRing } from "./jaguar-progress-ring";
import { JaguarAnimatedCounter } from "./jaguar-animated-counter";
import {
  JaguarFloatingButton,
  JaguarInteractiveCard,
  JaguarNotificationDot,
  JaguarLoadingDots
} from "./jaguar-micro-interactions";
import { 
  Play, 
  Pause, 
  Plus, 
  Heart, 
  Star,
  Trophy,
  Target,
  Zap,
  Activity,
  TrendingUp
} from "lucide-react";

export const JaguarComponentsDemo = () => {
  const [progress, setProgress] = useState(75);
  const [counter, setCounter] = useState(150);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleProgressChange = () => {
    setProgress(Math.random() * 100);
  };

  const handleCounterChange = () => {
    setCounter(Math.floor(Math.random() * 500) + 50);
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold jaguar-gradient-primary bg-clip-text text-transparent">
          JAGUAR FIGHT CLUB
        </h1>
        <p className="text-muted-foreground">Animated Components & Micro-interactions</p>
      </div>

      {/* Shimmer Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Shimmer Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <JaguarShimmerButton variant="primary" size="md">
            <Play className="w-4 h-4" />
            Start Training
          </JaguarShimmerButton>
          
          <JaguarShimmerButton variant="secondary" size="md">
            <Trophy className="w-4 h-4" />
            View Progress
          </JaguarShimmerButton>
          
          <JaguarShimmerButton variant="accent" size="md">
            <Star className="w-4 h-4" />
            Rate Session
          </JaguarShimmerButton>
          
          <JaguarShimmerButton variant="success" size="md">
            <Target className="w-4 h-4" />
            Complete Goal
          </JaguarShimmerButton>
        </div>
      </section>

      {/* Ripple Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Ripple Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <JaguarRippleButton variant="primary" size="sm">
            <Heart className="w-3 h-3" />
            Like
          </JaguarRippleButton>
          
          <JaguarRippleButton variant="secondary" size="md">
            <Activity className="w-4 h-4" />
            Track Workout
          </JaguarRippleButton>
          
          <JaguarRippleButton variant="accent" size="lg">
            <Zap className="w-5 h-5" />
            Power Move
          </JaguarRippleButton>
          
          <JaguarRippleButton variant="success" size="md">
            <TrendingUp className="w-4 h-4" />
            Progress
          </JaguarRippleButton>
          
          <JaguarRippleButton variant="outline" size="md">
            <Plus className="w-4 h-4" />
            Add Exercise
          </JaguarRippleButton>
        </div>
      </section>

      {/* Pulse Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pulse Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <JaguarPulseButton 
            variant="primary" 
            intensity="subtle"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Start"} Training
          </JaguarPulseButton>
          
          <JaguarPulseButton variant="secondary" intensity="medium">
            <Trophy className="w-4 h-4" />
            Championship Mode
          </JaguarPulseButton>
          
          <JaguarPulseButton variant="accent" intensity="strong">
            <Zap className="w-4 h-4" />
            Ultimate Challenge
          </JaguarPulseButton>
        </div>
      </section>

      {/* Progress Rings & Counters */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Progress Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <JaguarProgressRing
              progress={progress}
              variant="primary"
              size={120}
              animated={true}
            />
            <button
              onClick={handleProgressChange}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Update Progress
            </button>
          </div>
          
          <div className="text-center space-y-2">
            <JaguarProgressRing
              progress={85}
              variant="secondary"
              size={120}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-[#4ECDC4]">85%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </JaguarProgressRing>
            <p className="text-sm text-muted-foreground">Weekly Goal</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="bg-card rounded-lg p-4 border">
              <div className="text-sm text-muted-foreground mb-2">Training Sessions</div>
              <JaguarAnimatedCounter
                value={counter}
                variant="primary"
                size="lg"
                animate={true}
              />
            </div>
            <button
              onClick={handleCounterChange}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Update Counter
            </button>
          </div>
          
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Streak</div>
              <JaguarAnimatedCounter
                value={28}
                suffix=" days"
                variant="accent"
                size="md"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Members</div>
              <JaguarAnimatedCounter
                value={1247}
                prefix="+"
                variant="success"
                size="md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Interactive Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <JaguarInteractiveCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Trophy className="w-8 h-8 text-[#FF6B35]" />
                <JaguarNotificationDot 
                  count={3} 
                  variant="primary" 
                  size="sm"
                  className="absolute -top-1 -right-1"
                />
              </div>
              <div>
                <h3 className="font-semibold">Achievements</h3>
                <p className="text-sm text-muted-foreground">View your latest wins</p>
              </div>
            </div>
          </JaguarInteractiveCard>
          
          <JaguarInteractiveCard className="p-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-[#4ECDC4]" />
              <div>
                <h3 className="font-semibold">Workout Plans</h3>
                <p className="text-sm text-muted-foreground">Personalized training</p>
              </div>
            </div>
          </JaguarInteractiveCard>
          
          <JaguarInteractiveCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Star className="w-8 h-8 text-[#FFD93D]" />
                <JaguarNotificationDot 
                  variant="accent" 
                  size="sm"
                  className="absolute -top-1 -right-1"
                />
              </div>
              <div>
                <h3 className="font-semibold">Community</h3>
                <p className="text-sm text-muted-foreground">Connect with fighters</p>
              </div>
            </div>
          </JaguarInteractiveCard>
        </div>
      </section>

      {/* Micro-interactions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Micro-interactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Dots</h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <JaguarNotificationDot count={5} variant="primary" size="sm" />
                <span className="text-sm">Messages</span>
              </div>
              <div className="flex items-center space-x-2">
                <JaguarNotificationDot count={12} variant="secondary" size="md" />
                <span className="text-sm">Notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <JaguarNotificationDot count={99} variant="accent" size="lg" />
                <span className="text-sm">Updates</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Loading States</h3>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <JaguarLoadingDots variant="primary" size="sm" />
                <span className="text-sm">Loading...</span>
              </div>
              <div className="flex items-center space-x-2">
                <JaguarLoadingDots variant="secondary" size="md" />
                <span className="text-sm">Processing...</span>
              </div>
              <div className="flex items-center space-x-2">
                <JaguarLoadingDots variant="accent" size="lg" />
                <span className="text-sm">Syncing...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <JaguarFloatingButton
        icon={<Plus className="w-6 h-6" />}
        label="Add New Workout"
        variant="primary"
        size="lg"
        position="bottom-right"
        onClick={() => alert("Add new workout clicked!")}
      />
      
      <JaguarFloatingButton
        icon={<Heart className="w-5 h-5" />}
        label="Favorites"
        variant="secondary"
        size="md"
        position="bottom-left"
        onClick={() => alert("Favorites clicked!")}
      />
    </div>
  );
};