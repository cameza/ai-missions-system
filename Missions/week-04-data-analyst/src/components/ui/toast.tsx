/**
 * Toast Notification System
 * Custom themed toast notifications using sonner
 */

'use client';

import React from 'react';
import { toast, Toaster } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast Types
type ToastType = 'success' | 'error' | 'warning' | 'info';

// Custom Toast Component
interface CustomToastProps {
  type: ToastType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function CustomToast({ type, title, description, action }: CustomToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const borderColors = {
    success: 'border-l-4 border-emerald-500',
    error: 'border-l-4 border-red-500',
    warning: 'border-l-4 border-yellow-500',
    info: 'border-l-4 border-blue-500'
  };

  return (
    <div 
      className={`surface border border-surface-border rounded-md shadow-lg p-4 ${borderColors[type]} max-w-sm w-full`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-primary">
            {title}
          </p>
          
          {description && (
            <p className="mt-1 text-sm text-secondary">
              {description}
            </p>
          )}
          
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => toast.dismiss()}
          className="ml-4 flex-shrink-0 text-tertiary hover:text-secondary transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Helper Functions
export const showToast = {
  success: (title: string, description?: string, options?: any) => {
    return toast.success(title, {
      description,
      ...options
    });
  },
  
  error: (title: string, description?: string, options?: any) => {
    return toast.error(title, {
      description,
      ...options,
      duration: 5000 // Errors stay longer
    });
  },
  
  warning: (title: string, description?: string, options?: any) => {
    return toast.warning(title, {
      description,
      ...options
    });
  },
  
  info: (title: string, description?: string, options?: any) => {
    return toast.info(title, {
      description,
      ...options
    });
  }
};

// Toast Provider Component
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      theme="dark"
      richColors
      closeButton
      expand={false}
      className="toast-notifications"
      toastOptions={{
        style: {
          background: 'hsl(var(--surface))',
          border: '1px solid hsl(var(--surface-border))',
          color: 'hsl(var(--primary))',
          borderRadius: '8px',
        },
        actionButtonStyle: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--background))',
        },
        cancelButtonStyle: {
          backgroundColor: 'hsl(var(--surface-border))',
          color: 'hsl(var(--secondary))',
        },
      }}
    />
  );
}

// Hook for toast notifications
export function useToast() {
  return {
    success: showToast.success,
    error: showToast.error,
    warning: showToast.warning,
    info: showToast.info,
    dismiss: toast.dismiss,
    promise: toast.promise
  };
}

// Network Status Toast Hook
export function useNetworkStatusToast() {
  const [isOnline, setIsOnline] = React.useState(true);
  const toastId = React.useRef<string | number | null>(null);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;
      }
      showToast.success('Connection restored', 'You are back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toastId.current = showToast.error(
        'Connection lost', 
        'Please check your internet connection',
        { duration: Infinity } // Keep showing until back online
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Progress Toast Hook
export function useProgressToast() {
  const startProgress = React.useCallback((title: string) => {
    return toast.loading(title, {
      description: 'Processing...'
    });
  }, []);

  const updateProgress = React.useCallback((id: string | number, progress: number, description?: string) => {
    toast.loading(description || `Processing... ${progress}%`, {
      id,
      description: `${progress}% complete`
    });
  }, []);

  const completeProgress = React.useCallback((id: string | number, title: string, description?: string) => {
    toast.success(title, {
      id,
      description
    });
  }, []);

  const errorProgress = React.useCallback((id: string | number, title: string, error?: string) => {
    toast.error(title, {
      id,
      description: error
    });
  }, []);

  return {
    startProgress,
    updateProgress,
    completeProgress,
    errorProgress
  };
}
