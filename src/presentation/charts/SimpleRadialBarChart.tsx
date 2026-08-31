"use client";

import {
  Legend,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CHART_COLORS,
  DEFAULT_CHART_HEIGHT,
} from "@/presentation/charts/theme";

export type RadialBarDatum = {
  name: string;
  value: number;
  fill?: string;
};

export type SimpleRadialBarChartProps = {
  data: RadialBarDatum[];
  height?: number;
  /** Field holding the numeric value (default `value`). */
  dataKey?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  cx?: string | number;
  /** Max domain for the radial scale (default auto from data). */
  domainMax?: number;
  barSize?: number;
};

/**
 * Generic radial bar chart — pass `{ name, value }[]`.
 * @see https://recharts.github.io/en-US/examples/SimpleRadialBarChart/
 */
export const SimpleRadialBarChart = ({
  data,
  height = DEFAULT_CHART_HEIGHT + 40,
  dataKey = "value",
  showLegend = true,
  showTooltip = true,
  cx = "40%",
  domainMax,
  barSize = 14,
}: SimpleRadialBarChartProps) => {
  if (data.length === 0) {
    return null;
  }

  const colored = data.map((row, i) => ({
    ...row,
    fill: row.fill ?? CHART_COLORS[i % CHART_COLORS.length],
  }));

  const autoMax = Math.max(...colored.map((r) => Number(r.value) || 0), 1);
  const max = domainMax ?? autoMax;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RadialBarChart
          cx={cx}
          cy="50%"
          innerRadius="18%"
          outerRadius="95%"
          barSize={barSize}
          data={colored}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
          <RadialBar
            background
            dataKey={dataKey}
            cornerRadius={6}
            label={{ position: "insideStart", fill: "#fff", fontSize: 11 }}
          />
          {showLegend ? (
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />
          ) : null}
          {showTooltip ? (
            <Tooltip
              formatter={(value, name) => [Number(value), String(name)]}
            />
          ) : null}
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};
