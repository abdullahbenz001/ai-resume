"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return "stroke-emerald-500 dark:stroke-emerald-400";
  if (score >= 60) return "stroke-amber-500 dark:stroke-amber-400";
  return "stroke-rose-500 dark:stroke-rose-400";
}

function scoreTextColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function ScoreRing({
  score,
  size = 128,
  strokeWidth = 10,
  className,
}: ScoreRingProps) {
  const [progress, setProgress] = useState(0);
  const clamped = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Match score ${clamped} out of 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-1000 ease-out",
            scoreColor(clamped)
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-3xl font-semibold tracking-tight tabular-nums",
            scoreTextColor(clamped)
          )}
        >
          {clamped}
        </span>
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          / 100
        </span>
      </div>
    </div>
  );
}
