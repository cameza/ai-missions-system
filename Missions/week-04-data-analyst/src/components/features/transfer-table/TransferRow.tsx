"use client"

/**
 * Transfer Table Row Component
 * 
 * Individual row component for the desktop transfer table view.
 * Displays player info, club details, transfer fee, and status with proper styling.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { Transfer } from '@/types';
import { ArrowRight } from 'lucide-react';

interface TransferRowProps {
  transfer: Transfer;
  className?: string;
}

export function TransferRow({ transfer, className = '' }: TransferRowProps) {
  // Safety check - if transfer is undefined, show error state
  if (!transfer) {
    return (
      <div className={`flex items-center justify-center p-4 border-b border-gray-800 ${className}`}>
        <div className="text-red-400 text-sm">Transfer data not available</div>
      </div>
    );
  }

  return (
    <div 
      className={`group flex items-center justify-between p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer ${className}`}
    >
      {/* Player Column */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Player Photo (placeholder) */}
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-medium">
          {(transfer.player_first_name?.charAt(0) || '')}{(transfer.player_last_name?.charAt(0) || '')}
        </div>
        
        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium truncate">
              {transfer.player_full_name}
            </span>
            {/* Nationality Flag (placeholder) */}
            {transfer.nationality && (
              <span className="text-xs text-gray-400">
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

      {/* From Club Column */}
      <div className="flex items-center gap-2 w-32 min-w-0">
        {/* Club Logo (placeholder) */}
        <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-white text-xs">
          {transfer.from_club_name?.charAt(0) || '?'}
        </div>
        <span className="text-gray-300 text-sm truncate">
          {transfer.from_club_name}
        </span>
      </div>

      {/* Transfer Arrow */}
      <ArrowRight className="w-4 h-4 text-gray-500 mx-2" />

      {/* To Club Column */}
      <div className="flex items-center gap-2 w-32 min-w-0">
        {/* Club Logo (placeholder) */}
        <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-white text-xs">
          {transfer.to_club_name?.charAt(0) || '?'}
        </div>
        <span className="text-gray-300 text-sm truncate">
          {transfer.to_club_name}
        </span>
      </div>

      {/* Transfer Fee Column */}
      <div className="flex items-center gap-2 w-32">
        <span className="text-white font-medium">
          {transfer.transfer_value_display}
        </span>
      </div>

      {/* Transfer Date Column */}
      <div className="w-28">
        <span className="text-gray-300 text-sm">
          {(() => {
            const transferDate = transfer.transfer_date;
            // Handle both string and Date types
            let dateStr: string;
            if (typeof transferDate === 'string') {
              dateStr = transferDate;
            } else {
              // Convert Date to YYYY-MM-DD format, then parse as local
              dateStr = transferDate.toISOString().split('T')[0];
            }
            // Parse as local date to avoid timezone shift
            const [year, month, day] = dateStr.split('-').map(Number);
            const localDate = new Date(year, month - 1, day);
            return localDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
          })()}
        </span>
      </div>

      {/* Hover Arrow Indicator */}
      <div className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4 text-[#8B5CF6]" />
      </div>
    </div>
  );
}
