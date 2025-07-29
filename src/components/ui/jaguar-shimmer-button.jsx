import React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary: {
    background: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)",
    shimmerColor: "#FFFFFF",
    textColor: "text-white"
  },
  secondary: {
    background: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)", 
    shimmerColor: "#FFFFFF",
    textColor: "text-white"
  },
  accent: {
    background: "linear-gradient(135deg, #FFD93D 0%, #FFC107 100%)",
    shimmerColor: "#FFFFFF",
    textColor: "text-black"
  },
  success: {
    background: "linear-gradient(135deg, #6BCF7F 0%, #4CAF50 100%)",
    shimmerColor: "#FFFFFF", 
    textColor: "text-white"
  }
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm min-h-[36px]",
  md: "px-6 py-3 text-base min-h-[44px]",
  lg: "px-8 py-4 text-lg min-h-[52px]"
};

export const JaguarShimmerButton = React.forwardRef(
  (
    {
      shimmerColor,
      shimmerSize = "0.05em",
      shimmerDuration = "2.5s",
      borderRadius = "12px",
      background,
      className,
      children,
      variant = "primary",
      size = "md",
      ...props
    },
    ref,
  ) => {
    const variantStyle = variantStyles[variant];
    const finalShimmerColor = shimmerColor || variantStyle.shimmerColor;
    const finalBackground = background || variantStyle.background;

    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": finalShimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": finalBackground,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border-0 font-medium [background:var(--bg)] [border-radius:var(--radius)] transition-all duration-300 ease-in-out",
          "transform-gpu active:translate-y-px active:scale-[0.98]",
          "hover:shadow-lg hover:-translate-y-0.5",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          sizeStyles[size],
          variantStyle.textColor,
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer container */}
        <div
          className={cn(
            "-z-30 blur-[1px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2 font-semibold">
          {children}
        </span>

        {/* Highlight overlay */}
        <div
          className={cn(
            "absolute inset-0 size-full rounded-[inherit]",
            "shadow-[inset_0_-8px_10px_rgba(255,255,255,0.1)]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_12px_rgba(255,255,255,0.2)]",
            "group-active:shadow-[inset_0_-10px_10px_rgba(255,255,255,0.3)]",
          )}
        />

        {/* Backdrop */}
        <div
          className={cn(
            "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
          )}
        />
      </button>
    );
  },
);

JaguarShimmerButton.displayName = "JaguarShimmerButton";