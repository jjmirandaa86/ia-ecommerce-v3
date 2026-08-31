"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_COLORS,
  CHART_GRID,
  CHART_TICK,
  DEFAULT_CHART_HEIGHT,
} from "@/presentation/charts/theme";

export type DashedLineSeries = {
  dataKey: string;
  name?: string;
  stroke?: string;
  /** e.g. `"5 5"` — defaults to a dashed stroke. */
  strokeDasharray?: string;
  strokeWidth?: number;
};

export type DashedLineChartProps = {
  data: Array<Record<string, unknown>>;
  xKey: string;
  series: DashedLineSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  xTickFormatter?: (value: string) => string;
  yAllowDecimals?: boolean;
  yTickFormatter?: (value: number) => string;
};

/**
 * Generic dashed line chart — pass only `data` + series keys.
 * @see https://recharts.github.io/en-US/examples/DashedLineChart/
 */
export const DashedLineChart = ({
  data,
  xKey,
  series,
  height = DEFAULT_CHART_HEIGHT,
  showLegend = false,
  showGrid = true,
  xTickFormatter,
  yAllowDecimals = true,
  yTickFormatter,
}: DashedLineChartProps) => {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
        >
          {showGrid ? (
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          ) : null}
          <XAxis
            dataKey={xKey}
            tickFormatter={xTickFormatter}
            tick={{ fontSize: 12, fill: CHART_TICK }}
          />
          <YAxis
            allowDecimals={yAllowDecimals}
            tickFormatter={yTickFormatter}
            tick={{ fontSize: 12, fill: CHART_TICK }}
            width={48}
          />
          <Tooltip />
          {showLegend ? <Legend /> : null}
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              stroke={s.stroke ?? CHART_COLORS[i % CHART_COLORS.length]}
              strokeDasharray={s.strokeDasharray ?? "5 5"}
              strokeWidth={s.strokeWidth ?? 2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
