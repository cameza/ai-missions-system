/**
 * Loading State Components
 * Consistent loading indicators for different UI contexts
 */

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

// Base loading spinner component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 
      className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
      aria-label="Loading"
    />
  );
}

// Full page loading
export function FullPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center background" aria-live="polite" aria-busy="true">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-secondary">Loading Transfer Hub...</p>
      </div>
    </div>
  );
}

// Skeleton loader for cards
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-surface-border/50 rounded-md h-32"></div>
        </div>
      ))}
    </div>
  );
}

// Skeleton loader for transfer table rows
export function TransferTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-live="polite" aria-busy="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse flex items-center space-x-4 p-3 surface rounded-md">
          <div className="w-8 h-8 bg-surface-border/50 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-border/50 rounded w-3/4"></div>
            <div className="h-3 bg-surface-border/50 rounded w-1/2"></div>
          </div>
          <div className="h-4 bg-surface-border/50 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}

// Skeleton loader for KPI cards
export function KPICardSkeleton() {
  return (
    <div className="animate-pulse surface rounded-md border border-surface-border p-6">
      <div className="h-4 bg-surface-border/50 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-surface-border/50 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-surface-border/50 rounded w-1/3"></div>
    </div>
  );
}

// Skeleton loader for charts
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div 
      className="animate-pulse surface rounded-md border border-surface-border"
      style={{ height: `${height}px` }}
      aria-live="polite" aria-busy="true"
    >
      <div className="h-full flex items-center justify-center">
        <div className="text-tertiary">Loading chart...</div>
      </div>
    </div>
  );
}

// Loading overlay for components
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export function LoadingOverlay({ isLoading, children, message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 background/80 backdrop-blur-sm flex items-center justify-center rounded-md" aria-live="polite" aria-busy="true">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-2" />
            <p className="text-secondary text-sm">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline loading for buttons
interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function LoadingButton({ 
  isLoading, 
  children, 
  disabled = false, 
  className = '' 
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center px-4 py-2 border border-transparent 
        text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}

// Progress bar for operations with known progress
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ progress, className = '', showPercentage = false }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex items-center justify-between mb-1" style={{ display: showPercentage ? 'flex' : 'none' }}>
        <span className="text-sm text-secondary">Progress</span>
        <span className="text-sm text-secondary">{Math.round(clampedProgress)}%</span>
      </div>
      <div className="w-full bg-surface-border rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
}

// Staggered loading animation for lists
export function StaggeredLoading({ 
  items, 
  renderItem 
}: { 
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * 50}ms`,
            animationDuration: '300ms',
            animationFillMode: 'both',
          }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const toggleLoading = React.useCallback(() => {
    setIsLoading(prev => !prev);
  }, []);

  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
    toggleLoading,
  };
}
