import React from "react";
import { cn } from "@/lib/utils";

// Fallback version of TextAnimate without Motion dependencies
export const TextAnimate = ({
  children,
  className,
  animation,
  by,
  delay = 0,
  ...props
}) => {
  // Simple CSS-based animation fallback
  return (
    <div 
      className={cn(
        "animate-fade-in",
        animation === "slideUp" && "animate-slide-up",
        animation === "blurIn" && "animate-blur-in",
        className
      )}
      style={{
        animationDelay: `${delay}ms`
      }}
      {...props}
    >
      {children}
    </div>
  );
};