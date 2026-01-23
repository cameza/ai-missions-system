/**
 * Transfer Table Filter Bar
 * 
 * Contains search input and status filter toggle for the transfer table.
 * Implements debounced search and simplified All/Confirmed filtering for soft launch.
 * 
 * @version 1.0
 * @since 2025-01-19
 */

"use client"

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useTransferStore } from '@/lib/stores/useTransferStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  className?: string;
}

export function FilterBar({ className = '' }: FilterBarProps) {
  const searchQuery = useTransferStore((state) => state.searchQuery);
  const setSearchQuery = useTransferStore((state) => state.setSearchQuery);
  const sortBy = useTransferStore((state) => state.sortBy);
  const sortOrder = useTransferStore((state) => state.sortOrder);
  const setSorting = useTransferStore((state) => state.setSorting);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search handler (300ms delay)
  const debouncedSearch = useCallback(
    (query: string) => {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        setSearchQuery(query);
      }, 300);
    },
    [setSearchQuery]
  );

  // Sorting options
  const sortOptions = [
    { value: 'transferDate', label: 'Date' },
    { value: 'transferValueDisplay', label: 'Fee' },
    { value: 'playerFullName', label: 'Player Name' },
    { value: 'fromClubName', label: 'From Club' },
    { value: 'toClubName', label: 'To Club' },
  ];

  // Get current sort display
  const getCurrentSortDisplay = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : 'Date';
  };

  // Handle sort selection
  const handleSortSelect = (field: string) => {
    const newDirection = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSorting(field, newDirection);
    setIsSortDropdownOpen(false);
  };

  // Keep local input in sync with global store
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    debouncedSearch(query);
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search players or teams..."
          value={localSearchQuery}
          onChange={handleSearchChange}
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
        />
      </div>

      {/* Sort Dropdown - Visible on Mobile */}
      <div className="relative md:hidden">
        <Button
          variant="ghost"
          onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 flex items-center gap-2"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Sort: {getCurrentSortDisplay()}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Dropdown Menu */}
        {isSortDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
            <div className="py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 flex items-center justify-between ${
                    sortBy === option.value ? 'bg-gray-700 text-[#8B5CF6]' : 'text-gray-300'
                  }`}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
