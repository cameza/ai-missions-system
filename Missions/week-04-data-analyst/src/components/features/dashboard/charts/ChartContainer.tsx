"use client";

import { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { ChartErrorBoundary } from "./ChartErrorBoundary";

interface ChartContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
  aspectRatio?: number;
  isLoading?: boolean;
  error?: string | null;
  responsive?: boolean;
  headerAction?: ReactNode;
}

export function ChartContainer({
  title,
  children,
  className,
  aspectRatio = 16 / 9,
  isLoading = false,
  error = null,
  responsive = true,
  headerAction,
}: ChartContainerProps) {
  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-6 bg-surface border border-red-500/20 rounded-lg min-h-[200px]",
          className
        )}
        role="alert"
        aria-label={`Chart error: ${title}`}
      >
        <div className="text-red-400 text-sm mb-2">⚠️ Chart Error</div>
        <div className="text-gray-500 text-xs text-center">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-surface border border-gray-800 rounded-lg p-4 min-h-[200px] animate-pulse",
          className
        )}
        style={{ aspectRatio }}
        aria-label={`Loading chart: ${title}`}
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

  return (
    <div
      className={cn(
        "bg-surface border border-gray-800 rounded-lg p-4",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div style={{ aspectRatio }} className="w-full">
        {responsive ? (
          <ResponsiveContainer width="100%" height="100%">
            <ChartErrorBoundary>
              {children}
            </ChartErrorBoundary>
          </ResponsiveContainer>
        ) : (
          <ChartErrorBoundary>
            {children}
          </ChartErrorBoundary>
        )}
      </div>
    </div>
  );
}
