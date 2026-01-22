"use client";

import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  className?: string;
  aspectRatio?: number;
}

export function ChartSkeleton({ 
  className, 
  aspectRatio = 16 / 9 
}: ChartSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-gray-800 rounded-lg p-4 min-h-[350px] animate-pulse",
        className
      )}
      style={{ aspectRatio }}
      aria-label="Loading chart"
    >
      <div className="h-4 bg-gray-800 rounded mb-4 w-1/3"></div>
      <div className="space-y-2">
        <div className="h-2 bg-gray-800 rounded"></div>
        <div className="h-2 bg-gray-800 rounded w-5/6"></div>
        <div className="h-2 bg-gray-800 rounded w-4/6"></div>
      </div>
    </div>
  );
}
