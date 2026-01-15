import toast, { type ToastOptions, type ToastPosition } from 'react-hot-toast';

// Custom toast styles that match our design system
const baseOptions: Partial<ToastOptions> = {
  position: 'top-right',
  duration: 4000,
  style: {
    background: 'white',
    color: '#1e293b',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
};

const successIconTheme = {
  primary: '#10b981',
  secondary: 'white',
};

const errorIconTheme = {
  primary: '#ef4444',
  secondary: 'white',
};

// Toast service with typed methods
export const toastService = {
  success: (message: string, options?: Partial<ToastOptions>) => {
    return toast.success(message, {
      ...baseOptions,
      iconTheme: successIconTheme,
      ...options,
    });
  },

  error: (message: string, options?: Partial<ToastOptions>) => {
    return toast.error(message, {
      ...baseOptions,
      iconTheme: errorIconTheme,
      duration: 6000, // Errors stay longer
      ...options,
    });
  },

  warning: (message: string, options?: Partial<ToastOptions>) => {
    return toast(message, {
      ...baseOptions,
      icon: '⚠️',
      iconTheme: {
        primary: '#f59e0b',
        secondary: 'white',
      },
      ...options,
    });
  },

  info: (message: string, options?: Partial<ToastOptions>) => {
    return toast(message, {
      ...baseOptions,
      iconTheme: {
        primary: '#3b82f6',
        secondary: 'white',
      },
      ...options,
    });
  },

  loading: (message: string, options?: Partial<ToastOptions>) => {
    return toast.loading(message, {
      ...baseOptions,
      duration: Infinity, // Loading toasts don't auto-dismiss
      ...options,
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  // Custom toast for specific actions
  missionCreated: (title: string) => {
    return toast.success(`Mission "${title}" created successfully`, {
      ...baseOptions,
      iconTheme: successIconTheme,
      duration: 3000,
    });
  },

  missionUpdated: (title: string) => {
    return toast.success(`Mission "${title}" updated successfully`, {
      ...baseOptions,
      iconTheme: successIconTheme,
      duration: 3000,
    });
  },

  missionDeleted: (title: string) => {
    return toast.success(`Mission "${title}" deleted successfully`, {
      ...baseOptions,
      iconTheme: successIconTheme,
      duration: 3000,
    });
  },

  progressAdded: () => {
    return toast.success('Progress update added successfully', {
      ...baseOptions,
      iconTheme: successIconTheme,
      duration: 3000,
    });
  },

  storageError: (message: string) => {
    return toast.error(`Storage error: ${message}`, {
      ...baseOptions,
      iconTheme: errorIconTheme,
      duration: 8000,
    });
  },

  storageQuotaWarning: () => {
    return toast('Storage quota nearly exceeded. Consider deleting old missions or progress updates.', {
      ...baseOptions,
      icon: '⚠️',
      iconTheme: {
        primary: '#f59e0b',
        secondary: 'white',
      },
      duration: 10000,
    });
  },

  networkError: () => {
    return toast.error('Network error. Please check your connection and try again.', {
      ...baseOptions,
      iconTheme: errorIconTheme,
      duration: 6000,
    });
  },

  validationError: (message: string) => {
    return toast.error(message, {
      ...baseOptions,
      iconTheme: errorIconTheme,
      duration: 5000,
    });
  },
};

// Export the toast instance for advanced usage
export { toast };

// Export types for TypeScript users
export type { ToastOptions, ToastPosition };
