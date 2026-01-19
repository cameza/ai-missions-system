/**
 * Query Client Provider
 * Wraps the app with TanStack Query provider and DevTools
 */

'use client';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';

interface QueryClientProviderProps {
  children: React.ReactNode;
  enableDevTools?: boolean;
}

export function QueryClientProviderWrapper({ 
  children, 
  enableDevTools = process.env.NODE_ENV === 'development' 
}: QueryClientProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableDevTools && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

// Export a hook for getting the query client
export const useQueryClientInstance = () => queryClient;
