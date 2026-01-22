"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer } from "./ChartContainer";
import { CustomTooltip } from "./CustomTooltip";

interface DailyActivityData {
  date: string;
  activity: number;
}

interface DailyActivityChartProps {
  data: DailyActivityData[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  aspectRatio?: number;
}

const CHART_COLORS = {
  primary: "#00FF88", // Neon Green
  grid: "#2A2A35", // Subtle grid
  area: "rgba(0, 255, 136, 0.1)", // Subtle area fill
};

export function DailyActivityChart({
  data,
  isLoading = false,
  error = null,
  className,
  aspectRatio = 16 / 9,
}: DailyActivityChartProps) {
  return (
    <ChartContainer
      title="Daily Activity"
      isLoading={isLoading}
      error={error}
      className={className}
      aspectRatio={aspectRatio}
    >
      <AreaChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 0,
          bottom: 5,
        }}
        role="img"
        aria-label="Daily Activity line chart"
      >
        <defs>
          <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={CHART_COLORS.grid}
          opacity={0.3}
        />
        <XAxis
          dataKey="date"
          tick={{
            fill: "#9CA3AF",
            fontSize: 10,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          width={30}
          tick={{
            fill: "#9CA3AF",
            fontSize: 10,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            fill: "rgba(0, 255, 136, 0.1)",
            stroke: "#00FF88",
            strokeWidth: 1,
          }}
        />
        <Area
          type="monotone"
          dataKey="activity"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          fill="url(#colorActivity)"
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ChartContainer>
  );
}
