"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  useActiveTooltipDataPoints,
  useIsTooltipActive,
  type PieLabelRenderProps,
  type PieSectorShapeProps,
} from "recharts";
import {
  CHART_COLORS,
  DEFAULT_CHART_HEIGHT,
} from "@/presentation/charts/theme";

export type PieChartDatum = {
  name: string;
  value: number;
  /** Optional stable id for keys / fills. */
  id?: string;
  fill?: string;
};

export type PieChartWithLabelProps = {
  data: PieChartDatum[];
  height?: number;
  showLegend?: boolean;
  colors?: readonly string[];
  /** Inner radius for donut look; 0 = full pie. */
  innerRadius?: number;
  outerRadius?: number;
};

const RADIAN = Math.PI / 180;

const renderPercentLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null;
  }
  const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
  const ncx = Number(cx);
  const ncy = Number(cy);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  if ((percent ?? 0) < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

const ActivePieSector = (
  props: PieSectorShapeProps & { colors: readonly string[] },
) => {
  const activePoints = useActiveTooltipDataPoints();
  const isAnyActive = useIsTooltipActive();
  const isThisActive = isAnyActive && props.payload === activePoints?.[0];
  const fillOpacity = isAnyActive && !isThisActive ? 0.45 : 1;
  const fill =
    typeof props.fill === "string"
      ? props.fill
      : props.colors[props.index % props.colors.length];

  return (
    <Sector
      {...props}
      fill={fill}
      stroke="none"
      fillOpacity={fillOpacity}
      style={{ transition: "fill-opacity 0.3s ease" }}
    />
  );
};

/**
 * Generic pie with percent labels — pass `{ name, value }[]`.
 * @see https://recharts.github.io/en-US/examples/PieChartWithCustomizedLabel/
 */
export const PieChartWithLabel = ({
  data,
  height = DEFAULT_CHART_HEIGHT + 60,
  showLegend = true,
  colors = CHART_COLORS,
  innerRadius = 0,
  outerRadius = 100,
}: PieChartWithLabelProps) => {
  if (data.length === 0) {
    return null;
  }

  const colored = data.map((row, i) => ({
    ...row,
    fill: row.fill ?? colors[i % colors.length],
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={colored}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            labelLine={false}
            label={renderPercentLabel}
            shape={(props) => (
              <ActivePieSector {...props} colors={colors} />
            )}
          >
            {colored.map((row, i) => (
              <Cell
                key={row.id ?? row.name}
                fill={row.fill ?? colors[i % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [Number(value), String(name)]}
          />
          {showLegend ? <Legend /> : null}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
