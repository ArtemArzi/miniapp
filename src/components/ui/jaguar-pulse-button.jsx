import React from "react";
import { cn } from "@/lib/utils";

// interface JaguarPulseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
  variant?: "primary" | "secondary" | "accent" | "success";
  size?: "sm" | "md" | "lg";
  intensity?: "subtle" | "medium" | "strong";
}

const variantStyles = {
  primary: {
    background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)",
    color: "text-white",
    pulseColor: "#FF6B35"
  },
  secondary: {
    background: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
    color: "text-white",
    pulseColor: "#4ECDC4"
  },
  accent: {
    background: "linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)",
    color: "text-black", 
    pulseColor: "#FFD93D"
  },
  success: {
    background: "linear-gradient(135deg, #6BCF7F 0%, #4CAF50 100%)",
    color: "text-white",
    pulseColor: "#6BCF7F"
  }
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm min-h-[36px]",
  md: "px-6 py-3 text-base min-h-[44px]",
  lg: "px-8 py-4 text-lg min-h-[52px]"
};

const intensityStyles = {
  subtle: "animate-pulse-subtle",
  medium: "animate-pulse",
  strong: "animate-pulse-strong"
};

export const JaguarPulseButton = React.forwardRef(
  (
    {
      className,
      children,
      pulseColor,
      duration = "2s",
      variant = "primary",
      size = "md",
      intensity = "medium",
      ...props
    },
    ref,
  ) => {
    const variantStyle = variantStyles[variant];
    const finalPulseColor = pulseColor || variantStyle.pulseColor;

    return (
      <button
        ref={ref}
        className={cn(
          "relative flex cursor-pointer items-center justify-center font-semibold rounded-lg transition-all duration-300 ease-in-out overflow-hidden",
          "transform-gpu hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] active:translate-y-0",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          sizeStyles[size],
          variantStyle.color,
          className,
        )}
        style={{
          background: variantStyle.background,
          "--pulse-color": finalPulseColor,
          "--duration": duration,
        }
        {...props}
      >
        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          {children}
        </div>

        {/* Pulse rings */}
        <div className="absolute inset-0 -z-10">
          {/* First pulse ring */}
          <div 
            className={cn(
              "absolute inset-0 rounded-lg opacity-75",
              intensityStyles[intensity]
            )}
            style={{
              background: variantStyle.background,
              animationDuration: duration,
              animationDelay: "0s"
            }}
          />
          
          {/* Second pulse ring - delayed */}
          <div 
            className={cn(
              "absolute inset-0 rounded-lg opacity-50",
              intensityStyles[intensity] 
            )}
            style={{
              background: variantStyle.background,
              animationDuration: duration,
              animationDelay: "0.5s"
            }}
          />
        </div>

        {/* Glow effect */}
        <div 
          className="absolute -inset-1 rounded-lg blur-sm opacity-30 animate-pulse"
          style={{
            background: finalPulseColor,
            animationDuration: duration
          }}
        />
      </button>
    );
  },
);

JaguarPulseButton.displayName = "JaguarPulseButton";