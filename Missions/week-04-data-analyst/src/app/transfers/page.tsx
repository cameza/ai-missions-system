/**
 * Transfers Page
 * 
 * Demo page for testing the transfer table implementation.
 * Shows the TransferTableContainer with all features.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

"use client"

import { TransferTableContainer } from '@/components/features/transfer-table/TransferTableContainer';
import { useTransfers } from '@/hooks/useTransfers';
import { useTransferStore } from '@/lib/stores/useTransferStore';

export default function TransfersPage() {
  const { transfers, isLoading, hasNextPage, loadMore, error } = useTransfers();
  const { setSorting } = useTransferStore();

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSorting(field, direction);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Transfer Hub</h1>
          <div className="text-red-400">
            Error loading transfers: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transfer Hub</h1>
          <p className="text-gray-400">
            Latest football transfers and market activity
          </p>
        </div>

        {/* Transfer Table */}
        <TransferTableContainer
          transfers={transfers}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}
