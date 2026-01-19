/**
 * Test Component for Feedback System
 * Demonstrates usage of all loading, error, and feedback components
 */

'use client';

import React from 'react';
import { 
  LoadingSpinner, 
  FullPageLoading, 
  CardSkeleton,
  KPICardSkeleton,
  Skeleton,
  ErrorMessage,
  EmptyState,
  ToastProvider,
  useToast,
  useNetworkStatusToast
} from '@/components/ui/feedback-components';

export default function FeedbackTestPage() {
  const toast = useToast();
  const isOnline = useNetworkStatusToast();

  const handleTestSuccess = () => {
    toast.success('Operation completed', 'Data was saved successfully');
  };

  const handleTestError = () => {
    toast.error('Operation failed', 'Please try again later');
  };

  const handleTestWarning = () => {
    toast.warning('Warning', 'This action cannot be undone');
  };

  const handleTestInfo = () => {
    toast.info('Information', 'New features are available');
  };

  return (
    <div className="min-h-screen background p-8">
      <ToastProvider />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Feedback Components Test</h1>
        
        {/* Loading Components */}
        <section className="surface rounded-md border border-surface-border p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">Loading Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading Spinner Sizes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-secondary">Loading Spinner</h3>
              <div className="flex space-x-4">
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
              </div>
            </div>
            
            {/* Skeleton Components */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-secondary">Skeletons</h3>
              <Skeleton width="100%" height={20} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton lines={3} />
            </div>
            
            {/* Card Skeleton */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-secondary">Card Skeleton</h3>
              <CardSkeleton />
            </div>
          </div>
          
          {/* KPI Card Skeleton */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-secondary mb-4">KPI Card Skeleton</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </div>
          </div>
        </section>
        
        {/* Error Components */}
        <section className="surface rounded-md border border-surface-border p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">Error Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Error Message */}
            <div>
              <h3 className="text-lg font-medium text-secondary mb-4">Error Message</h3>
              <ErrorMessage
                title="Network Error"
                message="Failed to connect to the server. Please check your internet connection."
                onRetry={() => console.log('Retry clicked')}
              />
            </div>
            
            {/* Empty State */}
            <div>
              <h3 className="text-lg font-medium text-secondary mb-4">Empty State</h3>
              <EmptyState
                title="No data available"
                description="There are no transfers to display at this time."
                action={
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                    Refresh Data
                  </button>
                }
              />
            </div>
          </div>
        </section>
        
        {/* Toast Test */}
        <section className="surface rounded-md border border-surface-border p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">Toast Notifications</h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleTestSuccess}
              className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
            >
              Success Toast
            </button>
            
            <button
              onClick={handleTestError}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Error Toast
            </button>
            
            <button
              onClick={handleTestWarning}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Warning Toast
            </button>
            
            <button
              onClick={handleTestInfo}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Info Toast
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-secondary">
              Network Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
            </p>
          </div>
        </section>
        
        {/* Full Page Loading Test */}
        <section className="surface rounded-md border border-surface-border p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">Full Page Loading</h2>
          <button
            onClick={() => {
              // This would typically be shown during route transitions or data loading
              console.log('Full page loading would be shown here');
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Test Full Page Loading
          </button>
        </section>
      </div>
    </div>
  );
}
