"use client"

/**
 * Transfer Card Component
 * 
 * Mobile-optimized card view for individual transfers.
 * Displays all transfer information in a compact, touch-friendly layout.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { Transfer } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowRight, User, Building2, DollarSign, Calendar } from 'lucide-react';

interface TransferCardProps {
  transfer: Transfer;
  className?: string;
}

export function TransferCard({ transfer, className = '' }: TransferCardProps) {
  // Helper function to get status variant for Badge component
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return 'done' as const;
      case 'pending':
        return 'pending' as const;
      case 'rumour':
      case 'rumor':
        return 'rumor' as const;
      default:
        return 'outline' as const;
    }
  };

  // Helper function to get status display text
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return 'DONE';
      case 'pending':
        return 'PENDING';
      case 'rumour':
      case 'rumor':
        return 'RUMOUR';
      default:
        return status.toUpperCase();
    }
  };

  // Helper function to format transfer date
  const formatTransferDate = (date: Date | string) => {
    let dateStr: string;
    if (typeof date === 'string') {
      dateStr = date;
    } else {
      // Convert Date to YYYY-MM-DD format, then parse as local
      dateStr = date.toISOString().split('T')[0];
    }
    // Parse as local date to avoid timezone shift
    const [year, month, day] = dateStr.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${className}`}>
      {/* Header with Player Info and Status */}
      <div className="flex items-start justify-between mb-3">
        {/* Player Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Player Photo (placeholder) */}
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {(transfer.player_first_name?.charAt(0) || '')}{(transfer.player_last_name?.charAt(0) || '')}
          </div>
          
          {/* Player Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-medium truncate">
                {transfer.player_full_name}
              </span>
              {/* Nationality Flag (placeholder) */}
              {transfer.nationality && (
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {transfer.nationality.toUpperCase()}
                </span>
              )}
            </div>
            {transfer.position && (
              <div className="text-xs text-gray-400">
                {transfer.position}
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={getStatusVariant(transfer.status)} className="flex-shrink-0">
          {getStatusText(transfer.status)}
        </Badge>
      </div>

      {/* Transfer Details */}
      <div className="space-y-3">
        {/* Club Transfer */}
        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* From Club */}
            <div className="flex items-center gap-1 min-w-0">
              <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center text-white text-xs flex-shrink-0">
                {transfer.from_club_name?.charAt(0) || '?'}
              </div>
              <span className="text-gray-300 text-sm truncate">
                {transfer.from_club_name}
              </span>
            </div>
            
            {/* Arrow */}
            <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
            
            {/* To Club */}
            <div className="flex items-center gap-1 min-w-0">
              <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center text-white text-xs flex-shrink-0">
                {transfer.to_club_name?.charAt(0) || '?'}
              </div>
              <span className="text-gray-300 text-sm truncate">
                {transfer.to_club_name}
              </span>
            </div>
          </div>
        </div>

        {/* Transfer Fee */}
        <div className="flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-white font-medium text-sm">
            {transfer.transfer_value_display}
          </span>
        </div>

        {/* Transfer Date */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-white font-medium text-sm">
            {formatTransferDate(transfer.transfer_date)}
          </span>
        </div>

        {/* Additional Details */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          {transfer.age && (
            <span>Age: {transfer.age}</span>
          )}
          {transfer.league_name && (
            <span className="truncate ml-auto">
              {transfer.league_name}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
