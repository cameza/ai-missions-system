"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartTooltipEntry {
  name: string;
  value: number | string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
  className?: string;
  children?: ReactNode;
}

export function CustomTooltip({
  active,
  payload,
  label,
  className,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-surface/90 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3 shadow-lg",
        "transition-all duration-200 ease-in-out",
        className
      )}
      role="tooltip"
    >
      {label && (
        <div className="text-xs font-mono text-gray-400 mb-2">{label}</div>
      )}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300">{entry.name}:</span>
          <span className="text-white font-medium ml-auto">
            {typeof entry.value === "number" 
              ? entry.value.toLocaleString() 
              : entry.value
            }
          </span>
        </div>
      ))}
    </div>
  );
}
