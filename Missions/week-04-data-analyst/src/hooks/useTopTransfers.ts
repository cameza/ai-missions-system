"use client"

import { useQuery } from "@tanstack/react-query"

export interface TopTransfer {
  id: string
  rank: number
  playerName: string
  fromClub: string
  toClub: string
  transferValue: string
  transferValueUsd?: number
}

export const useTopTransfersQuery = (initialData?: TopTransfer[]) => {
  return useQuery({
    queryKey: ['top-transfers'],
    queryFn: async (): Promise<TopTransfer[]> => {
      const response = await fetch('/api/top-transfers?v=' + Date.now()) // Add version parameter
      if (!response.ok) {
        throw new Error('Failed to fetch top transfers')
      }
      const result = await response.json()
      // Handle API response structure: {success: true, data: {data: [...], window: "...", totalInWindow: N}}
      console.log('API Response:', result) // Debug log
      if (result.success && result.data && result.data.data) {
        return result.data.data // Extract the inner data array
      }
      // Fallback for old format or direct array
      return result.data || result || []
    },
    initialData: initialData || undefined,
    staleTime: 0, // Force immediate refresh
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
