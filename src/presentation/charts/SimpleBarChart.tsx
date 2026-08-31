"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_BAR,
  CHART_COLORS,
  CHART_GRID,
  CHART_TICK,
  DEFAULT_CHART_HEIGHT,
} from "@/presentation/charts/theme";

export type SimpleBarSeries = {
  dataKey: string;
  name?: string;
  fill?: string;
  radius?: number | [number, number, number, number];
};

export type SimpleBarChartProps = {
  data: Array<Record<string, unknown>>;
  xKey: string;
  series: SimpleBarSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  yTickFormatter?: (value: number) => string;
  tooltipFormatter?: (
    value: number | string,
    name: string,
  ) => [string | number, string];
};

/**
 * Generic bar chart — pass only `data` + series keys.
 * @see https://recharts.github.io/en-US/examples/SimpleBarChart/
 */
export const SimpleBarChart = ({
  data,
  xKey,
  series,
  height = DEFAULT_CHART_HEIGHT,
  showLegend = false,
  showGrid = true,
  yTickFormatter,
  tooltipFormatter,
}: SimpleBarChartProps) => {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
        >
          {showGrid ? (
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          ) : null}
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: CHART_TICK }} />
          <YAxis
            tickFormatter={yTickFormatter}
            tick={{ fontSize: 12, fill: CHART_TICK }}
            width={64}
          />
          <Tooltip
            formatter={
              tooltipFormatter
                ? (value, name) =>
                    tooltipFormatter(Number(value), String(name))
                : undefined
            }
          />
          {showLegend ? <Legend /> : null}
          {series.map((s, i) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              fill={
                s.fill ??
                (series.length === 1
                  ? CHART_BAR
                  : CHART_COLORS[i % CHART_COLORS.length])
              }
              radius={s.radius ?? [8, 8, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
