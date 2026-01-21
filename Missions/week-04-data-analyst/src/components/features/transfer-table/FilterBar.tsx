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
import { Search } from 'lucide-react';
import { useTransferStore } from '@/lib/stores/useTransferStore';
import { Input } from '@/components/ui/input';

interface FilterBarProps {
  className?: string;
}

export function FilterBar({ className = '' }: FilterBarProps) {
  const searchQuery = useTransferStore((state) => state.searchQuery);
  const setSearchQuery = useTransferStore((state) => state.setSearchQuery);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
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
    </div>
  );
}
