"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ChartSkeleton } from "./charts";
import { useTransfersByLeague, useTopTeamsVolume, useDailyActivity } from "@/hooks/use-analytics";

// Lazy load charts for performance optimization
const TransfersByLeagueChart = dynamic(
  () => import("./charts").then((mod) => mod.TransfersByLeagueChart),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

const TopTeamsVolumeChart = dynamic(
  () => import("./charts").then((mod) => mod.TopTeamsVolumeChart),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

const DailyActivityChart = dynamic(
  () => import("./charts").then((mod) => mod.DailyActivityChart),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);


export function DashboardCharts() {
  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useTransfersByLeague();
  const { data: teamsData, isLoading: teamsLoading, error: teamsError } = useTopTeamsVolume();
  const { data: dailyData, isLoading: dailyLoading, error: dailyError } = useDailyActivity();

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="col-span-1">
        <Suspense fallback={<ChartSkeleton />}>
          <TransfersByLeagueChart 
            data={leagueData || []} 
            isLoading={leagueLoading}
            error={leagueError?.message}
          />
        </Suspense>
      </div>
      
      <div className="col-span-1">
        <Suspense fallback={<ChartSkeleton />}>
          <TopTeamsVolumeChart 
            data={teamsData || []} 
            isLoading={teamsLoading}
            error={teamsError?.message}
          />
        </Suspense>
      </div>
      
      <div className="col-span-1">
        <Suspense fallback={<ChartSkeleton />}>
          <DailyActivityChart 
            data={dailyData || []} 
            isLoading={dailyLoading}
            error={dailyError?.message}
          />
        </Suspense>
      </div>
    </div>
  );
}
