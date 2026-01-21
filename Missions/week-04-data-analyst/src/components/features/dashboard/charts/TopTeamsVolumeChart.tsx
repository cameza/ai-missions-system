"use client";

import { ChartContainer } from "./ChartContainer";
import { cn } from "@/lib/utils";

interface TopTeamsVolumeData {
  team: string;
  volume: number;
}

interface TopTeamsVolumeChartProps {
  data: TopTeamsVolumeData[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

const COLORS = [
  "#00FF88", // Neon Green
  "#8B5CF6", // Electric Purple
];

export function TopTeamsVolumeChart({
  data,
  isLoading = false,
  error = null,
  className,
}: TopTeamsVolumeChartProps) {
  // Find the maximum volume to calculate percentages
  const maxVolume = Math.max(...data.map((d) => d.volume), 0);

  return (
    <ChartContainer
      title="TOP TEAMS VOLUME"
      isLoading={isLoading}
      error={error}
      className={className}
      responsive={false}
      headerAction={<span className="text-xs text-gray-500 font-mono">IN/OUT</span>}
    >
      <div className="flex flex-col justify-between h-full py-2 space-y-4">
        {data.map((item, index) => {
          const percentage = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0;
          // Alternate colors, starting with Green as per mockup
          const color = COLORS[index % COLORS.length];
          
          return (
            <div key={item.team} className="w-full group">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {item.team}
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {item.volume}
                </span>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}40`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartContainer>
  );
}
