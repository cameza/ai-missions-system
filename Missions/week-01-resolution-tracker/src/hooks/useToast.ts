import { useCallback } from 'react';
import { toastService } from '../lib/toast';
import type { ToastOptions } from 'react-hot-toast';

/**
 * Custom hook for easy toast notifications
 * Provides all toast methods with consistent typing
 */
export const useToast = () => {
  const success = useCallback((message: string, options?: Partial<ToastOptions>) => {
    return toastService.success(message, options);
  }, []);

  const error = useCallback((message: string, options?: Partial<ToastOptions>) => {
    return toastService.error(message, options);
  }, []);

  const warning = useCallback((message: string, options?: Partial<ToastOptions>) => {
    return toastService.warning(message, options);
  }, []);

  const info = useCallback((message: string, options?: Partial<ToastOptions>) => {
    return toastService.info(message, options);
  }, []);

  const loading = useCallback((message: string, options?: Partial<ToastOptions>) => {
    return toastService.loading(message, options);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    return toastService.dismiss(toastId);
  }, []);

  // Mission-specific toasts
  const missionCreated = useCallback((title: string) => {
    return toastService.missionCreated(title);
  }, []);

  const missionUpdated = useCallback((title: string) => {
    return toastService.missionUpdated(title);
  }, []);

  const missionDeleted = useCallback((title: string) => {
    return toastService.missionDeleted(title);
  }, []);

  const progressAdded = useCallback(() => {
    return toastService.progressAdded();
  }, []);

  // Error-specific toasts
  const storageError = useCallback((message: string) => {
    return toastService.storageError(message);
  }, []);

  const storageQuotaWarning = useCallback(() => {
    return toastService.storageQuotaWarning();
  }, []);

  const networkError = useCallback(() => {
    return toastService.networkError();
  }, []);

  const validationError = useCallback((message: string) => {
    return toastService.validationError(message);
  }, []);

  return {
    // Basic toasts
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    
    // Mission toasts
    missionCreated,
    missionUpdated,
    missionDeleted,
    progressAdded,
    
    // Error toasts
    storageError,
    storageQuotaWarning,
    networkError,
    validationError,
  };
};

export type UseToastReturn = ReturnType<typeof useToast>;
