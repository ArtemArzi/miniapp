"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Floating Action Button with micro-interactions
/* interface JaguarFloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  variant?: "primary" | "secondary" | "accent" | "success";
  size?: "sm" | "md" | "lg";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}
*/

export const JaguarFloatingButton = ({
  icon,
  label,
  variant = "primary",
  size = "md",
  position = "bottom-right",
  className,
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-[#FF6B35]/25",
    secondary: "bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] text-white shadow-[#4ECDC4]/25",
    accent: "bg-gradient-to-r from-[#FFD93D] to-[#FFC107] text-black shadow-[#FFD93D]/25",
    success: "bg-gradient-to-r from-[#6BCF7F] to-[#4CAF50] text-white shadow-[#6BCF7F]/25"
  };

  const sizeStyles = {
    sm: "w-12 h-12 text-sm",
    md: "w-14 h-14 text-base", 
    lg: "w-16 h-16 text-lg"
  };

  const positionStyles = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "top-right": "fixed top-6 right-6",
    "top-left": "fixed top-6 left-6"
  };

  return (
    <div className="relative">
      <button
        className={cn(
          "rounded-full flex items-center justify-center font-semibold transition-all duration-300 ease-out",
          "transform-gpu z-50",
          "shadow-lg hover:shadow-xl",
          "focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary/50",
          positionStyles[position],
          sizeStyles[size],
          variantStyles[variant],
          isHovered && "scale-110 -translate-y-1",
          isPressed && "scale-95 translate-y-0",
          className
        )}
        onMouseEnter={(e) => {
          setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={onClick}
        {...props}
      >
        <span className={cn(
          "transform transition-transform duration-200",
          isPressed && "scale-90"
        )}>
          {icon}
        </span>
      </button>

      {/* Label tooltip */}
      {label && isHovered && (
        <div className={cn(
          "absolute bg-black/80 text-white text-sm px-3 py-1 rounded-lg pointer-events-none transition-all duration-200",
          "whitespace-nowrap z-40",
          position.includes("right") ? "right-full mr-3" : "left-full ml-3",
          "top-1/2 -translate-y-1/2",
          "animate-fade-in"
        )}>
          {label}
          <div className={cn(
            "absolute w-2 h-2 bg-black/80 rotate-45 top-1/2 -translate-y-1/2",
            position.includes("right") ? "right-[-4px]" : "left-[-4px]"
          )} />
        </div>
      )}
    </div>
  );
};

// Interactive Card with hover effects
/* interface JaguarInteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverScale?: number;
  clickScale?: number;
  shadowColor?: string;
}
*/

export const JaguarInteractiveCard = ({
  children,
  hoverScale = 1.02,
  clickScale = 0.98,
  shadowColor = "rgba(0, 0, 0, 0.1)",
  className,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg bg-card border transition-all duration-300 ease-out cursor-pointer",
        "transform-gpu",
        isHovered && `scale-[${hoverScale}]`,
        isPressed && `scale-[${clickScale}]`,
        className
      )}
      style={{
        boxShadow: isHovered 
          ? `0 10px 25px ${shadowColor}, 0 4px 10px ${shadowColor}` 
          : `0 2px 8px ${shadowColor}`
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        setIsPressed(true);
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        setIsPressed(false);
        onMouseUp?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Bouncing Notification Dot
/* interface JaguarNotificationDotProps {
  count?: number;
  variant?: "primary" | "secondary" | "accent" | "success";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}
*/

export const JaguarNotificationDot = ({
  count,
  variant = "primary",
  size = "md",
  animate = true,
  className
}) => {
  const variantStyles = {
    primary: "bg-[#FF6B35] text-white",
    secondary: "bg-[#4ECDC4] text-white",
    accent: "bg-[#FFD93D] text-black", 
    success: "bg-[#6BCF7F] text-white"
  };

  const sizeStyles = {
    sm: count ? "min-w-[16px] h-4 text-[10px] px-1" : "w-2 h-2",
    md: count ? "min-w-[20px] h-5 text-xs px-1.5" : "w-3 h-3",
    lg: count ? "min-w-[24px] h-6 text-sm px-2" : "w-4 h-4"
  };

  if (!count && count !== 0) {
    return (
      <div className={cn(
        "rounded-full flex items-center justify-center font-bold",
        animate && "animate-bounce",
        variantStyles[variant],
        sizeStyles[size],  
        className
      )} />
    );
  }

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-bold",
      animate && count > 0 && "animate-pulse",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {count > 99 ? "99+" : count}
    </div>
  );
};

// Loading Dots Animation
/* interface JaguarLoadingDotsProps {
  variant?: "primary" | "secondary" | "accent" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
}
*/

export const JaguarLoadingDots = ({
  variant = "primary",
  size = "md",
  className
}) => {
  const variantStyles = {
    primary: "bg-[#FF6B35]",
    secondary: "bg-[#4ECDC4]",
    accent: "bg-[#FFD93D]",
    success: "bg-[#6BCF7F]"
  };

  const sizeStyles = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "rounded-full animate-bounce",
            variantStyles[variant],
            sizeStyles[size]
          )}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: "0.6s"
          }}
        />
      ))}
    </div>
  );
};