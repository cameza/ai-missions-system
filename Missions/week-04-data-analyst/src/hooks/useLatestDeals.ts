"use client"

import { useQuery } from '@tanstack/react-query';

export interface LatestDeal {
  id: string;
  rank: number;
  playerName: string;
  fromClub: string;
  toClub: string;
  transferValue: string;
  transferDate: string;
}

interface LatestDealsResponse {
  success: boolean;
  data: {
    data: LatestDeal[];
    timestamp: string;
  };
}

async function fetchLatestDeals(): Promise<LatestDeal[]> {
  const response = await fetch('/api/latest-deals', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch latest deals: ${response.status}`);
  }

  const result: LatestDealsResponse = await response.json();
  
  // Handle API response structure: {success: true, data: {data: [...], timestamp: "..."}}
  if (result.success && result.data && result.data.data) {
    return result.data.data; // Extract the inner data array
  }
  
  // Fallback for direct data format - should be an array
  return Array.isArray(result) ? result : [];
}

export function useLatestDealsQuery() {
  return useQuery({
    queryKey: ['latest-deals'],
    queryFn: fetchLatestDeals,
    staleTime: 5 * 60 * 1000,      // 5 minutes (matches API cache)
    refetchInterval: 10 * 60 * 1000, // 10 minutes auto-refresh
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
