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
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface TransferRowProps {
  transfer: Transfer;
  className?: string;
}

export function TransferRow({ transfer, className = '' }: TransferRowProps) {
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

  return (
    <div 
      className={`group flex items-center justify-between p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer ${className}`}
    >
      {/* Player Column */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Player Photo (placeholder) */}
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-medium">
          {transfer.playerFirstName.charAt(0)}{transfer.playerLastName.charAt(0)}
        </div>
        
        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium truncate">
              {transfer.playerFullName}
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
          {transfer.fromClubName.charAt(0)}
        </div>
        <span className="text-gray-300 text-sm truncate">
          {transfer.fromClubName}
        </span>
      </div>

      {/* Transfer Arrow */}
      <ArrowRight className="w-4 h-4 text-gray-500 mx-2" />

      {/* To Club Column */}
      <div className="flex items-center gap-2 w-32 min-w-0">
        {/* Club Logo (placeholder) */}
        <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-white text-xs">
          {transfer.toClubName.charAt(0)}
        </div>
        <span className="text-gray-300 text-sm truncate">
          {transfer.toClubName}
        </span>
      </div>

      {/* Transfer Fee Column */}
      <div className="w-24 text-right">
        <span className="text-white font-medium text-sm">
          {transfer.transferValueDisplay}
        </span>
      </div>

      {/* Status Column */}
      <div className="w-20 text-right">
        <Badge variant={getStatusVariant(transfer.status)}>
          {getStatusText(transfer.status)}
        </Badge>
      </div>

      {/* Hover Arrow Indicator */}
      <div className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-4 h-4 text-blue-400" />
      </div>
    </div>
  );
}
