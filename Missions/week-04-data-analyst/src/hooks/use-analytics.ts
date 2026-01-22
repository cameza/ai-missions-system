import { useQuery } from '@tanstack/react-query';

interface LeagueData {
  league: string;
  transfers: number;
}

interface TeamData {
  team: string;
  volume: number;
}

interface DailyData {
  date: string;
  activity: number;
}

export const useTransfersByLeague = () => {
  return useQuery<LeagueData[]>({
    queryKey: ['analytics', 'leagues'],
    queryFn: async () => {
      const res = await fetch('/api/analytics?type=leagues');
      if (!res.ok) {
        throw new Error('Failed to fetch transfers by league data');
      }
      const json = await res.json();
      return json.data || json; // Extract data from success response or fallback to direct response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useTopTeamsVolume = () => {
  return useQuery<TeamData[]>({
    queryKey: ['analytics', 'teams'],
    queryFn: async () => {
      const res = await fetch('/api/analytics?type=teams');
      if (!res.ok) {
        throw new Error('Failed to fetch top teams volume data');
      }
      const json = await res.json();
      return json.data || json; // Extract data from success response or fallback to direct response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useDailyActivity = () => {
  return useQuery<DailyData[]>({
    queryKey: ['analytics', 'daily'],
    queryFn: async () => {
      const res = await fetch('/api/analytics?type=daily');
      if (!res.ok) {
        throw new Error('Failed to fetch daily activity data');
      }
      const json = await res.json();
      return json.data || json; // Extract data from success response or fallback to direct response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
