"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ChartContainer } from "./ChartContainer";
import { CustomTooltip } from "./CustomTooltip";

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

const CHART_COLORS = {
  primary: "#8B5CF6", // Electric Purple
  secondary: "#3B82F6", // Bright Blue
  grid: "#2A2A35", // Subtle grid
};

export function TopTeamsVolumeChart({
  data,
  isLoading = false,
  error = null,
  className,
}: TopTeamsVolumeChartProps) {
  return (
    <ChartContainer
      title="Top Teams Volume"
      isLoading={isLoading}
      error={error}
      className={className}
      aspectRatio={16 / 9}
    >
      <BarChart
        data={data}
        layout="horizontal"
        margin={{
          top: 20,
          right: 30,
          left: 60,
          bottom: 5,
        }}
        role="img"
        aria-label="Top Teams Volume horizontal bar chart"
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={CHART_COLORS.grid}
          opacity={0.3}
        />
        <XAxis
          type="number"
          tick={{
            fill: "#9CA3AF",
            fontSize: 10,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="team"
          tick={{
            fill: "#9CA3AF",
            fontSize: 10,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            fill: "rgba(139, 92, 246, 0.1)",
            stroke: "#8B5CF6",
            strokeWidth: 1,
          }}
        />
        <Bar
          dataKey="volume"
          radius={[0, 4, 4, 0]}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index % 2 === 0 ? CHART_COLORS.primary : CHART_COLORS.secondary}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
