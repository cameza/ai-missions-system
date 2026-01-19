/**
 * Skeleton Component
 * Loading placeholder with pulse animation
 */

'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number; // For text variant
}

export function Skeleton({ 
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-surface-border/50';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-sm',
    rounded: 'rounded-md'
  };

  const style = React.useMemo(() => {
    const styleObj: React.CSSProperties = {};
    if (width) styleObj.width = typeof width === 'number' ? `${width}px` : width;
    if (height) styleObj.height = typeof height === 'number' ? `${height}px` : height;
    return styleObj;
  }, [width, height]);

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: index === lines - 1 ? '60%' : '100%' // Last line shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// Preset Skeleton Components

export function CardSkeleton() {
  return (
    <div className="surface rounded-md border border-surface-border p-6 space-y-4" aria-hidden="true">
      <Skeleton width="100%" height={24} className="mb-4" />
      <Skeleton width="75%" height={16} className="mb-2" />
      <Skeleton width="60%" height={16} />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-3 surface rounded-md" aria-hidden="true">
      <Skeleton variant="circular" width={32} height={32} />
      <div className="flex-1 space-y-2">
        <Skeleton width="75%" height={16} />
        <Skeleton width="50%" height={14} />
      </div>
      <Skeleton width={80} height={16} />
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="surface rounded-md border border-surface-border p-6" aria-hidden="true">
      <Skeleton width="50%" height={16} className="mb-4" />
      <Skeleton width="75%" height={32} className="mb-2" />
      <Skeleton width="33%" height={12} />
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div 
      className="surface rounded-md border border-surface-border flex items-center justify-center"
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <div className="text-center">
        <Skeleton width={200} height={20} className="mx-auto mb-2" />
        <Skeleton width={150} height={16} className="mx-auto" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {/* Header */}
      <div className="flex space-x-4 p-3 border-b border-surface-border">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} width={100} height={16} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center space-x-4 p-3 surface rounded-md">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              width={colIndex === 0 ? 32 : 100} 
              height={16}
              variant={colIndex === 0 ? 'circular' : 'rectangular'}
              className={colIndex === 0 ? '' : 'flex-1'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Hook for skeleton loading states
export function useSkeletonDelay(delay = 200) {
  const [showSkeleton, setShowSkeleton] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return showSkeleton;
}
