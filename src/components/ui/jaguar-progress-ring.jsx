import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// interface JaguarProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
  children?: React.ReactNode;
  showText?: boolean;
  animated?: boolean;
  duration?: number;
  variant?: "primary" | "secondary" | "accent" | "success";
}

const variantColors = {
  primary: "#FF6B35",
  secondary: "#4ECDC4", 
  accent: "#FFD93D",
  success: "#6BCF7F"
};

export const JaguarProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color,
  backgroundColor = "#e5e7eb",
  className,
  children,
  showText = true,
  animated = true,
  duration = 1000,
  variant = "primary"
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const finalColor = color || variantColors[variant];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={finalColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            "transition-all ease-in-out",
            animated ? "duration-1000" : "duration-300"
          )}
          style={{
            transitionDuration: animated ? `${duration}ms` : "300ms"
          }}
        />

        {/* Glow effect */}
        {animated && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={finalColor}
            strokeWidth={strokeWidth + 2}
            fill="transparent" 
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="opacity-30 blur-sm transition-all duration-1000 ease-in-out"
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showText && (
          <div className="text-center">
            <div 
              className="text-2xl font-bold transition-all duration-300"
              style={{ color: finalColor }}
            >
              {Math.round(animatedProgress)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};