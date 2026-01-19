"use client"

/**
 * Load More Button Component
 * 
 * Button for loading additional transfer records.
 * Implements the "LOAD MORE" functionality for pagination.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LoadMoreButton({ 
  onClick, 
  isLoading = false, 
  disabled = false, 
  className = '' 
}: LoadMoreButtonProps) {
  return (
    <div className={`flex justify-center mt-6 ${className}`}>
      <Button
        variant="secondary"
        size="default"
        onClick={onClick}
        disabled={disabled || isLoading}
        className="px-6 py-2 text-sm font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          'LOAD MORE'
        )}
      </Button>
    </div>
  );
}
