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

export const useTopTransfersQuery = () => {
  return useQuery({
    queryKey: ['top-transfers'],
    queryFn: async (): Promise<TopTransfer[]> => {
      const response = await fetch('/api/top-transfers')
      if (!response.ok) {
        throw new Error('Failed to fetch top transfers')
      }
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
