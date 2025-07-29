"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

/* 
interface JaguarRippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  duration?: string;
  variant?: "primary" | "secondary" | "accent" | "success" | "outline";
  size?: "sm" | "md" | "lg";
}
*/

const variantStyles = {
  primary: {
    background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)",
    color: "text-white",
    rippleColor: "#FFFFFF"
  },
  secondary: {
    background: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
    color: "text-white", 
    rippleColor: "#FFFFFF"
  },
  accent: {
    background: "linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)",
    color: "text-black",
    rippleColor: "#000000"
  },
  success: {
    background: "linear-gradient(135deg, #6BCF7F 0%, #4CAF50 100%)",
    color: "text-white",
    rippleColor: "#FFFFFF"
  },
  outline: {
    background: "transparent",
    color: "text-primary",
    rippleColor: "#FF6B35"
  }
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm min-h-[36px]",
  md: "px-6 py-3 text-base min-h-[44px]", 
  lg: "px-8 py-4 text-lg min-h-[52px]"
};

export const JaguarRippleButton = React.forwardRef(
  (
    {
      className,
      children,
      rippleColor,
      duration = "600ms",
      onClick,
      variant = "primary",
      size = "md",
      ...props
    },
    ref,
  ) => {
    const [buttonRipples, setButtonRipples] = useState([]);

    const variantStyle = variantStyles[variant];
    const finalRippleColor = rippleColor || variantStyle.rippleColor;

    const handleClick = (event) => {
      createRipple(event);
      onClick?.(event);
    };

    const createRipple = (event) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple = { x, y, size, key: Date.now() };
      setButtonRipples((prevRipples) => [...prevRipples, newRipple]);
    };

    useEffect(() => {
      if (buttonRipples.length > 0) {
        const lastRipple = buttonRipples[buttonRipples.length - 1];
        const timeout = setTimeout(() => {
          setButtonRipples((prevRipples) =>
            prevRipples.filter((ripple) => ripple.key !== lastRipple.key),
          );
        }, parseInt(duration));
        return () => clearTimeout(timeout);
      }
    }, [buttonRipples, duration]);

    return (
      <button
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden font-semibold rounded-lg transition-all duration-300 ease-in-out",
          "transform-gpu hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] active:translate-y-0",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          variant === "outline" ? "border-2 border-primary bg-transparent" : "",
          sizeStyles[size],
          variantStyle.color,
          className,
        )}
        style={{
          background: variant !== "outline" ? variantStyle.background : undefined
        }}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          {children}
        </div>

        {/* Ripple container */}
        <span className="pointer-events-none absolute inset-0">
          {buttonRipples.map((ripple) => (
            <span
              className="absolute animate-rippling rounded-full opacity-30"
              key={ripple.key}
              style={{
                width: `${ripple.size}px`,
                height: `${ripple.size}px`,
                top: `${ripple.y}px`,
                left: `${ripple.x}px`,
                backgroundColor: finalRippleColor,
                transform: `scale(0)`,
              }}
            />
          ))}
        </span>
      </button>
    );
  },
);

JaguarRippleButton.displayName = "JaguarRippleButton";