"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ChartContainer } from "./ChartContainer";
import { CustomTooltip } from "./CustomTooltip";

interface TransfersByLeagueData {
  league: string;
  transfers: number;
}

interface TransfersByLeagueChartProps {
  data: TransfersByLeagueData[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

const CHART_COLORS = {
  primary: "#8B5CF6", // Electric Purple
  secondary: "#3B82F6", // Bright Blue
  grid: "#2A2A35", // Subtle grid
};

export function TransfersByLeagueChart({
  data,
  isLoading = false,
  error = null,
  className,
}: TransfersByLeagueChartProps) {
  return (
    <ChartContainer
      title="Transfers by League"
      isLoading={isLoading}
      error={error}
      className={className}
      aspectRatio={16 / 9}
    >
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        role="img"
        aria-label="Transfers by League bar chart"
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={CHART_COLORS.grid}
          opacity={0.3}
        />
        <XAxis
          dataKey="league"
          tick={{
            fill: "#9CA3AF",
            fontSize: 10,
            fontFamily: "monospace",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
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
            fill: "rgba(139, 92, 246, 0.1)",
            stroke: "#8B5CF6",
            strokeWidth: 1,
          }}
        />
        <Bar
          dataKey="transfers"
          radius={[4, 4, 0, 0]}
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
