"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// interface JaguarAnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  variant?: "primary" | "secondary" | "accent" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

const variantStyles = {
  primary: "text-[#FF6B35]",
  secondary: "text-[#4ECDC4]",
  accent: "text-[#FFD93D]", 
  success: "text-[#6BCF7F]"
};

const sizeStyles = {
  sm: "text-lg font-semibold",
  md: "text-2xl font-bold",
  lg: "text-4xl font-bold",
  xl: "text-6xl font-bold"
};

export const JaguarAnimatedCounter = ({
  value,
  duration = 1000,
  className,
  suffix = "",
  prefix = "",
  variant = "primary",
  size = "md",
  animate = true
}) => {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();
    const startValue = displayValue;
    const difference = value - startValue;

    const animateCount = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (difference * easedProgress);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animateCount);
  }, [value, duration, animate]);

  const formatValue = (val) => {
    if (val % 1 === 0) {
      return Math.round(val).toString();
    }
    return val.toFixed(1);
  };

  return (
    <span className={cn(
      "font-mono transition-all duration-300",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
};