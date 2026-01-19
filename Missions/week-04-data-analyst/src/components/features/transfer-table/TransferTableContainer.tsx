"use client"

/**
 * Transfer Table Container Component
 * 
 * Orchestrator component that manages the transfer table display.
 * Handles responsive layout, data fetching, and state management.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { Transfer } from '@/types';
import { FilterBar } from './FilterBar';
import { TransferTable } from './TransferTable';
import { TransferCard } from './TransferCard';
import { LoadMoreButton } from './LoadMoreButton';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { useTransferStore } from '@/lib/stores/useTransferStore';

interface TransferTableContainerProps {
  transfers: Transfer[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function TransferTableContainer({
  transfers,
  isLoading = false,
  hasNextPage = false,
  onLoadMore,
  onSort,
  className = '',
}: TransferTableContainerProps) {
  const { searchQuery, statusFilter } = useTransferStore();

  // Show loading skeleton while loading
  if (isLoading && transfers.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <FilterBar />
        <div className="md:hidden space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="hidden md:block">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show empty state when no transfers found
  if (!isLoading && transfers.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <FilterBar />
        <div className="text-center py-12">
          <div className="text-gray-400 text-sm mb-2">
            No transfers found
          </div>
          {(searchQuery || statusFilter !== 'all') && (
            <div className="text-gray-500 text-xs">
              Try adjusting your search or filters
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Bar */}
      <FilterBar />

      {/* Desktop Table View */}
      <TransferTable
        transfers={transfers}
        onSort={onSort}
        className="hidden md:block"
      />

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {transfers.map((transfer) => (
          <TransferCard
            key={transfer.id}
            transfer={transfer}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <LoadMoreButton
          onClick={onLoadMore || (() => {})}
          isLoading={isLoading}
        />
      )}

      {/* Loading indicator for additional pages */}
      {isLoading && transfers.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="text-gray-400 text-sm">Loading more transfers...</div>
        </div>
      )}
    </div>
  );
}
