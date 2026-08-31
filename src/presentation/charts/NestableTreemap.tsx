"use client";

import { ResponsiveContainer, Tooltip, Treemap, type TreemapNode } from "recharts";
import {
  CHART_COLORS,
  DEFAULT_CHART_HEIGHT,
} from "@/presentation/charts/theme";

export type NestableTreemapNode = {
  name: string;
  value: number;
  fill?: string;
  children?: NestableTreemapNode[];
  /** Extra fields forwarded to tooltip (count, avgMs, …). */
  [key: string]: unknown;
};

export type NestableTreemapProps = {
  data: NestableTreemapNode[];
  height?: number;
  dataKey?: string;
  nameKey?: string;
  /** Format the primary value in tiles / tooltip. */
  formatValue?: (value: number) => string;
  /** Optional secondary line in tooltip. */
  formatTooltipDetail?: (node: NestableTreemapNode) => string | null;
  displayName?: (name: string) => string;
  colors?: readonly string[];
};

const defaultDisplayName = (name: string) => name;

const withFill = (
  nodes: NestableTreemapNode[],
  colors: readonly string[],
  depth = 0,
): NestableTreemapNode[] => {
  return nodes.map((node, index) => ({
    ...node,
    fill: node.fill ?? colors[(depth + index) % colors.length],
    children: node.children
      ? withFill(node.children, colors, depth + 1)
      : undefined,
  }));
};

/**
 * Generic nestable treemap — pass hierarchical `{ name, value, children? }[]`.
 * @see https://recharts.github.io/en-US/examples/BundleSizeTreemap/
 */
export const NestableTreemap = ({
  data,
  height = DEFAULT_CHART_HEIGHT + 40,
  dataKey = "value",
  nameKey = "name",
  formatValue = (v) => Intl.NumberFormat().format(v),
  formatTooltipDetail,
  displayName = defaultDisplayName,
  colors = CHART_COLORS,
}: NestableTreemapProps) => {
  if (data.length === 0) {
    return null;
  }

  const chartData = withFill(data, colors);

  const renderTile = (props: TreemapNode) => {
    const x = props.x ?? 0;
    const y = props.y ?? 0;
    const width = props.width ?? 0;
    const heightPx = props.height ?? 0;
    if (width <= 2 || heightPx <= 2) return <g />;

    const fill = typeof props.fill === "string" ? props.fill : colors[0];
    const label = displayName(String(props.name ?? ""));
    const value = Number(props.value ?? 0);
    const showLabel = width > 72 && heightPx > 28;
    const showValue = width > 100 && heightPx > 46;
    const ink = fill === "#84D2F6" || fill === "#91E5F6" ? "#133C55" : "#FFFFFF";

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={heightPx}
          fill={fill}
          stroke="#fff"
          strokeWidth={2}
          rx={4}
        />
        {showLabel ? (
          <text x={x + 8} y={y + 18} fill={ink} fontSize={12} fontWeight={700}>
            {label}
          </text>
        ) : null}
        {showValue ? (
          <text x={x + 8} y={y + 34} fill={ink} fontSize={11} opacity={0.9}>
            {formatValue(value)}
          </text>
        ) : null}
      </g>
    );
  };

  const nestCrumb = (item: TreemapNode, index: number) => {
    const raw = String(item.name ?? "");
    const label =
      index === 0 || raw === "root" ? "All" : displayName(raw);
    return (
      <span>
        {index === 0 ? "← " : ""}
        {label}
      </span>
    );
  };

  return (
    <div style={{ width: "100%", height, overflow: "visible" }}>
      <ResponsiveContainer>
        <Treemap
          data={chartData}
          dataKey={dataKey}
          nameKey={nameKey}
          aspectRatio={4 / 3}
          stroke="#fff"
          type="nest"
          content={renderTile}
          nestIndexContent={nestCrumb}
        >
          <Tooltip
            formatter={(value, name, item) => {
              const payload = item?.payload as NestableTreemapNode | undefined;
              const detail = payload ? formatTooltipDetail?.(payload) : null;
              const primary = formatValue(Number(value));
              return [
                detail ? `${primary} · ${detail}` : primary,
                displayName(String(name)),
              ];
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};
