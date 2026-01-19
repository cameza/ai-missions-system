/**
 * API Error Boundary Component
 * 
 * React Error Boundary specifically for API-related errors.
 * Provides user-friendly error messages and recovery options.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { TransferAPIError } from '@/lib/api/transfer-api-service';

/**
 * Props for APIErrorBoundary component
 */
export interface APIErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Fallback component to render on error */
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  /** Custom error message */
  errorMessage?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * API Error Boundary State
 */
interface APIErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Default Error Fallback Component
 */
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  const isServerError = error instanceof TransferAPIError && error.status >= 500;
  const isClientError = error instanceof TransferAPIError && error.status >= 400 && error.status < 500;
  
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          {isNetworkError ? (
            <WifiOff className="w-6 h-6 text-destructive" />
          ) : (
            <AlertCircle className="w-6 h-6 text-destructive" />
          )}
        </div>
        <CardTitle className="text-xl font-semibold">
          {isNetworkError ? 'Network Error' : 'Data Load Failed'}
        </CardTitle>
        <CardDescription>
          {isNetworkError 
            ? 'Unable to connect to the server. Please check your internet connection.'
            : isServerError
            ? 'Server is experiencing issues. Please try again in a moment.'
            : isClientError
            ? 'Invalid request. Please refresh the page.'
            : 'An unexpected error occurred while loading data.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {process.env.NODE_ENV === 'development' && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-mono text-muted-foreground break-all">
              {error.message}
            </p>
            {error instanceof TransferAPIError && (
              <p className="text-xs text-muted-foreground mt-1">
                Status: {error.status}
              </p>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            Reload Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * API Error Boundary Component
 * 
 * Catches and handles API-related errors with user-friendly messaging
 * and recovery options. Integrates with TanStack Query for cache invalidation.
 */
export class APIErrorBoundary extends Component<APIErrorBoundaryProps, APIErrorBoundaryState> {
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(props: APIErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<APIErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call error callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error for debugging
    console.error('API Error Boundary caught an error:', error, errorInfo);
  }

  /**
   * Reset error state and retry
   */
  reset = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // Max retries reached, reload page
      window.location.reload();
    }
  };

  /**
   * Reset with delay for exponential backoff
   */
  resetWithDelay = () => {
    const delay = this.retryDelay * Math.pow(2, this.state.retryCount);
    setTimeout(this.reset, delay);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback: Fallback, showRetry = true } = this.props;
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} reset={showRetry ? this.resetWithDelay : () => {}} />;
      }
      
      return <DefaultErrorFallback error={this.state.error} reset={showRetry ? this.resetWithDelay : () => {}} />;
    }

    return this.props.children;
  }
}

/**
 * Hook-based API Error Boundary
 * 
 * Functional component that uses hooks for error boundary functionality
 */
export function APIErrorBoundaryWrapper({ children, ...props }: APIErrorBoundaryProps) {
  const queryClient = useQueryClient();

  // Enhanced reset function that also clears query cache
  const enhancedReset = () => {
    // Clear only transfer-related queries on error reset
    queryClient.invalidateQueries({ queryKey: ['transfers'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
    queryClient.invalidateQueries({ queryKey: ['top-transfers'] });
    
    // Invalidate all queries to force fresh data
    queryClient.invalidateQueries();
  };

  return (
    <APIErrorBoundary {...props} onError={(error, errorInfo) => {
      // Clear only transfer-related cache on API errors
      if (error instanceof TransferAPIError) {
        queryClient.invalidateQueries({ queryKey: ['transfers'] });
        queryClient.invalidateQueries({ queryKey: ['summary'] });
        queryClient.invalidateQueries({ queryKey: ['top-transfers'] });
      }
      
      // Call original error handler
      props.onError?.(error, errorInfo);
    }}>
      {children}
    </APIErrorBoundary>
  );
}

/**
 * Higher-order component for API error boundary
 * 
 * Wraps a component with API error boundary
 */
export function withAPIErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<APIErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <APIErrorBoundaryWrapper {...errorBoundaryProps}>
      <Component {...props} />
    </APIErrorBoundaryWrapper>
  );

  WrappedComponent.displayName = `withAPIErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Custom hook for handling API errors outside of error boundaries
 */
export function useAPIErrorHandler() {
  const queryClient = useQueryClient();

  const handleError = (error: Error) => {
    // Log error
    console.error('API Error:', error);

    // Clear cache on API errors
    if (error instanceof TransferAPIError) {
      queryClient.clear();
    }

    // You could also send error to logging service here
    // logErrorToService(error);
  };

  const resetCache = () => {
    queryClient.clear();
    queryClient.invalidateQueries();
  };

  return {
    handleError,
    resetCache,
  };
}
