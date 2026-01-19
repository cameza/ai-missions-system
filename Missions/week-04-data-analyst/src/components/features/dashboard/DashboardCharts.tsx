"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ChartSkeleton } from "./charts";

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

// Mock data for development
const mockTransfersByLeague = [
  { league: "Premier League", transfers: 145 },
  { league: "La Liga", transfers: 98 },
  { league: "Serie A", transfers: 87 },
  { league: "Bundesliga", transfers: 76 },
  { league: "Ligue 1", transfers: 65 },
];

const mockTopTeamsVolume = [
  { team: "Chelsea", volume: 28 },
  { team: "Liverpool", volume: 24 },
  { team: "Man United", volume: 22 },
  { team: "Arsenal", volume: 19 },
  { team: "Man City", volume: 18 },
];

const mockDailyActivity = [
  { date: "Jan 14", activity: 12 },
  { date: "Jan 15", activity: 28 },
  { date: "Jan 16", activity: 45 },
  { date: "Jan 17", activity: 38 },
  { date: "Jan 18", activity: 52 },
  { date: "Jan 19", activity: 67 },
];

export function DashboardCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-1">
        <Suspense fallback={<ChartSkeleton />}>
          <TransfersByLeagueChart data={mockTransfersByLeague} />
        </Suspense>
      </div>
      
      <div className="lg:col-span-1">
        <Suspense fallback={<ChartSkeleton />}>
          <TopTeamsVolumeChart data={mockTopTeamsVolume} />
        </Suspense>
      </div>
      
      <div className="lg:col-span-2">
        <Suspense fallback={<ChartSkeleton />}>
          <DailyActivityChart data={mockDailyActivity} />
        </Suspense>
      </div>
    </div>
  );
}
