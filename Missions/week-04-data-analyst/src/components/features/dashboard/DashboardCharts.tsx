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
    <div className="flex overflow-x-auto pb-4 gap-6 snap-x snap-mandatory -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0 md:mx-0 md:px-0 hide-scrollbar">
      <div className="min-w-[85vw] snap-center md:min-w-0 col-span-1 h-[400px] md:h-full flex flex-col">
        <Suspense fallback={<ChartSkeleton className="h-full flex-1" />}>
          <TransfersByLeagueChart 
            data={leagueData || []} 
            isLoading={leagueLoading}
            error={leagueError?.message}
            className="h-full flex-1"
            aspectRatio={0}
          />
        </Suspense>
      </div>
      
      <div className="min-w-[85vw] snap-center md:min-w-0 col-span-1 h-[400px] md:h-full flex flex-col">
        <Suspense fallback={<ChartSkeleton className="h-full flex-1" />}>
          <TopTeamsVolumeChart 
            data={teamsData || []} 
            isLoading={teamsLoading}
            error={teamsError?.message}
            className="h-full flex-1"
            aspectRatio={0}
          />
        </Suspense>
      </div>
      
      <div className="min-w-[85vw] snap-center md:min-w-0 col-span-1 h-[400px] md:h-full flex flex-col">
        <Suspense fallback={<ChartSkeleton className="h-full flex-1" />}>
          <DailyActivityChart 
            data={dailyData || []} 
            isLoading={dailyLoading}
            error={dailyError?.message}
            className="h-full flex-1"
            aspectRatio={0}
          />
        </Suspense>
      </div>
    </div>
  );
}
