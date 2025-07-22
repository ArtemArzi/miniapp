"use client";

import { cn } from "@/lib/utils";
import { memo, useEffect, useRef, useState } from "react";

const TextAnimateBase = ({
  children,
  delay = 0,
  duration = 0.3,
  className,
  segmentClassName,
  as: Component = "p",
  by = "word",
  animation = "fadeIn",
  ...props
}) => {
  const [animated, setAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setAnimated(true);
          }, delay * 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  let segments = [];
  switch (by) {
    case "word":
      segments = children.split(/(\s+)/);
      break;
    case "character":
      segments = children.split("");
      break;
    case "line":
      segments = children.split("\n");
      break;
    case "text":
    default:
      segments = [children];
      break;
  }

  const getAnimationClass = (index) => {
    if (!animated) return "opacity-0";
    
    const animationDelay = index * 0.1;
    const animationClasses = {
      fadeIn: "animate-fade-in",
      blurIn: "animate-blur-in",
      slideUp: "animate-slide-up",
      scaleUp: "animate-scale-up",
    };

    return `${animationClasses[animation] || animationClasses.fadeIn}`;
  };

  return (
    <Component
      ref={elementRef}
      className={cn("whitespace-pre-wrap", className)}
      {...props}
    >
      {segments.map((segment, i) => (
        <span
          key={`${by}-${segment}-${i}`}
          className={cn(
            by === "line" ? "block" : "inline-block whitespace-pre",
            getAnimationClass(i),
            segmentClassName,
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${duration}s`,
            animationFillMode: "both",
          }}
        >
          {segment}
        </span>
      ))}
    </Component>
  );
};

export const TextAnimate = memo(TextAnimateBase);