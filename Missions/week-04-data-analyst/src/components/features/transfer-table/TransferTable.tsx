"use client"

/**
 * Transfer Table Component
 * 
 * Desktop table view for transfers with sortable columns and hover states.
 * Implements the 5-column layout specified in the requirements.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

import { Transfer } from '@/types';
import { TransferRow } from './TransferRow';
import { ArrowUpDown, User, Building2, DollarSign, Calendar } from 'lucide-react';
import { useTransferStore } from '@/lib/stores/useTransferStore';

interface TransferTableProps {
  transfers: Transfer[];
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

interface ColumnHeader {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sortable: boolean;
  width?: string;
}

export function TransferTable({ transfers, onSort, className = '' }: TransferTableProps) {
  const { sortBy, sortOrder } = useTransferStore();

  // Define table columns
  const columns: ColumnHeader[] = [
    {
      key: 'playerFullName',
      label: 'Player',
      icon: User,
      sortable: true,
      width: 'flex-1',
    },
    {
      key: 'fromClubName',
      label: 'From',
      icon: Building2,
      sortable: true,
      width: 'w-32',
    },
    {
      key: 'toClubName',
      label: 'To',
      icon: Building2,
      sortable: true,
      width: 'w-32',
    },
    {
      key: 'transferValueDisplay',
      label: 'Fee',
      icon: DollarSign,
      sortable: true,
      width: 'w-24',
    },
    {
      key: 'transferDate',
      label: 'Date',
      icon: Calendar,
      sortable: true,
      width: 'w-28',
    },
  ];

  // Handle column sorting
  const handleSort = (field: string) => {
    if (!onSort) return;
    
    const newDirection = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  };

  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    }
    
    return (
      <ArrowUpDown className={`w-3 h-3 text-[#8B5CF6] transform ${
        sortOrder === 'desc' ? 'rotate-180' : ''
      }`} />
    );
  };

  return (
    <div className={`hidden md:block ${className}`}>
      {/* Table Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="flex items-center">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 ${column.width} ${
                column.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''
              }`}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <column.icon className="w-3 h-3" />
              <span>{column.label}</span>
              {column.sortable && renderSortIcon(column.key)}
            </div>
          ))}
          {/* Extra column for hover arrow indicator */}
          <div className="w-6" />
        </div>
      </div>

      {/* Table Body */}
      <div className="bg-gray-900/50">
        {transfers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-sm">
              No transfers found
            </div>
          </div>
        ) : (
          transfers.map((transfer) => (
            <TransferRow
              key={transfer.id}
              transfer={transfer}
            />
          ))
        )}
      </div>
    </div>
  );
}
