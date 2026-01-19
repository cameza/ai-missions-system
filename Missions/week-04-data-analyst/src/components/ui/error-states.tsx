/**
 * Error State Components
 * Consistent error handling and feedback components
 */

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';

// Base Error Message Component
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  variant?: 'default' | 'inline';
}

export function ErrorMessage({ 
  title = 'Something went wrong',
  message,
  onRetry,
  isRetrying = false,
  className = '',
  variant = 'default'
}: ErrorMessageProps) {
  const baseClasses = variant === 'inline' 
    ? 'border-l-4 border-red-500/20 bg-red-500/10 p-4 rounded-md'
    : 'border border-red-500/20 bg-red-500/10 p-6 rounded-md text-center';

  return (
    <div 
      className={`${baseClasses} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      
      {title && (
        <h3 className="text-lg font-semibold text-red-500 mb-2">
          {title}
        </h3>
      )}
      
      <p className="text-red-400 mb-4 max-w-md mx-auto">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRetrying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Network Error Component
interface NetworkErrorProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  message?: string;
}

export function NetworkError({ 
  onRetry, 
  isRetrying = false,
  message = 'Connection lost. Please check your internet connection and try again.'
}: NetworkErrorProps) {
  return (
    <ErrorMessage
      title="Network Error"
      message={message}
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'search' | 'filter';
}

export function EmptyState({ 
  icon,
  title,
  description,
  action,
  className = '',
  variant = 'default'
}: EmptyStateProps) {
  const defaultIcon = variant === 'search' ? (
    <Search className="w-12 h-12 text-tertiary" />
  ) : variant === 'filter' ? (
    <Search className="w-12 h-12 text-tertiary" />
  ) : (
    <div className="w-12 h-12 rounded-full bg-surface-border/20 flex items-center justify-center">
      <span className="text-2xl text-tertiary">📭</span>
    </div>
  );

  return (
    <div 
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      
      <h3 className="text-lg font-semibold text-primary mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-secondary mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

// Search Empty State
export function SearchEmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description="Try adjusting your search terms or browse all transfers."
      action={onClear && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Clear Search
        </button>
      )}
    />
  );
}

// Filter Empty State
export function FilterEmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      variant="filter"
      title="No transfers found"
      description="No transfers match your current filters. Try adjusting your filter criteria."
      action={onClear && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    />
  );
}

// Error Boundary Fallback Component
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorBoundaryFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center background p-6">
      <div className="max-w-md w-full">
        <ErrorMessage
          title="Application Error"
          message={`Something unexpected happened. ${error.message}`}
          onRetry={resetError}
        />
      </div>
    </div>
  );
}

// Hook for error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Application error:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null
  };
}
