"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Title,
  Text,
  SimpleGrid,
  Stack,
  Group,
  Button,
  Loader,
  Paper,
} from "@mantine/core";
import { FiRefreshCw } from "react-icons/fi";
import {
  DashedLineChart,
  SimpleBarChart,
  PieChartWithLabel,
  NestableTreemap,
  type NestableTreemapNode,
} from "@/presentation/charts";
import { KpiCard, type KpiCardItem } from "@/presentation/dashboard/KpiCard";

type CostTreemapPoint = {
  name: string;
  value: number;
  count: number;
  avgMs: number;
  children?: CostTreemapPoint[];
};

type DashboardStats = {
  periodDays: number;
  kpis: {
    totalQueries: number;
    successRate: number;
    avgResponseMs: number;
    avgLlmMs: number;
    avgDbMs: number;
  };
  queriesOverTime: Array<{ date: string; count: number }>;
  latencyByService: Array<{ service: string; avgMs: number }>;
  queriesByEntity: Array<{ entity: string; count: number }>;
  queriesByCost: CostTreemapPoint[];
};

const EMPTY_STATS: DashboardStats = {
  periodDays: 7,
  kpis: {
    totalQueries: 0,
    successRate: 0,
    avgResponseMs: 0,
    avgLlmMs: 0,
    avgDbMs: 0,
  },
  queriesOverTime: [],
  latencyByService: [
    { service: "Classify", avgMs: 0 },
    { service: "LLM", avgMs: 0 },
    { service: "Build SQL", avgMs: 0 },
    { service: "Database", avgMs: 0 },
    { service: "Format", avgMs: 0 },
  ],
  queriesByEntity: [],
  queriesByCost: [],
};

const NAME_FILL: Record<string, string> = {
  product: "#133C55",
  review: "#386FA4",
  no_match: "#8D6E63",
  unknown: "#78909C",
  heuristic: "#84D2F6",
  llm: "#01497C",
};

const INTENT_FILL = ["#2A6F97", "#59A5D8", "#468FAF", "#61A5C2", "#4EA8DE"];

const formatNumber = (value: number): string =>
  Intl.NumberFormat().format(value);

const formatMs = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} s`;
  return `${Intl.NumberFormat().format(value)} ms`;
};

const shortDate = (value: string) => {
  const parts = value.split("-");
  return parts.length === 3 ? `${parts[1]}-${parts[2]}` : value;
};

const entityLabel = (entity: string): string => {
  if (entity === "no_match") return "No match";
  if (entity === "unknown") return "Unknown";
  return entity.charAt(0).toUpperCase() + entity.slice(1);
};

const costDisplayName = (name: string): string => {
  if (name === "no_match") return "No match";
  if (name === "unknown") return "Unknown";
  if (name === "heuristic") return "Heuristic";
  if (name === "llm") return "LLM";
  if (name === "product" || name === "review") {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return name.replaceAll("_", " ");
};

const withCostFill = (
  nodes: CostTreemapPoint[],
  depth = 0,
): NestableTreemapNode[] =>
  nodes.map((node, index) => ({
    ...node,
    fill:
      NAME_FILL[node.name] ??
      (depth >= 1 ? INTENT_FILL[index % INTENT_FILL.length] : "#386FA4"),
    children: node.children
      ? withCostFill(node.children, depth + 1)
      : undefined,
  }));

const kpiItems = (data: DashboardStats): KpiCardItem[] => [
  {
    label: "Total queries",
    value: formatNumber(data.kpis.totalQueries),
    hint: `Last ${data.periodDays} days`,
    tone: "queries",
  },
  {
    label: "Success rate",
    value: `${data.kpis.successRate}%`,
    hint: "Matched agent requests",
    tone: "success",
  },
  {
    label: "Avg response",
    value: `${formatNumber(data.kpis.avgResponseMs)} ms`,
    hint: "Total service time",
    tone: "response",
  },
  {
    label: "Avg LLM time",
    value: `${formatNumber(data.kpis.avgLlmMs)} ms`,
    hint: "Classification latency",
    tone: "llm",
  },
  {
    label: "Avg DB time",
    value: `${formatNumber(data.kpis.avgDbMs)} ms`,
    hint: "Database execution",
    tone: "database",
  },
];

/** Thin frame around a generic chart — title only, no chart logic. */
const ChartFrame = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <Paper p="md" withBorder radius="md" h="100%">
    <Text fw={600} mb={hint ? 0 : "sm"}>
      {title}
    </Text>
    {hint ? (
      <Text c="dimmed" size="sm" mb="sm">
        {hint}
      </Text>
    ) : null}
    {children}
  </Paper>
);

export const DashboardPanel = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats/overview", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Unable to load dashboard stats");
        setData(null);
        return;
      }
      setData(json.data as DashboardStats);
    } catch {
      setError("Unable to reach /api/stats/overview");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = data ?? EMPTY_STATS;
  const entityPie = stats.queriesByEntity.map((row) => ({
    id: row.entity,
    name: entityLabel(row.entity),
    value: row.count,
  }));
  const costTree = withCostFill(stats.queriesByCost);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text c="dimmed" size="sm">
            Agent usage from the last 7 days
          </Text>
        </div>
        <Button
          variant="light"
          leftSection={loading ? <Loader size={14} /> : <FiRefreshCw />}
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Group>

      {error ? (
        <Text c="red" size="sm">
          {error}
        </Text>
      ) : null}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }}>
        {kpiItems(stats).map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <ChartFrame title="Queries over time">
          <DashedLineChart
            data={stats.queriesOverTime}
            xKey="date"
            series={[
              {
                dataKey: "count",
                name: "Queries",
                stroke: "#386FA4",
                strokeDasharray: "5 5",
                strokeWidth: 3,
              },
            ]}
            xTickFormatter={shortDate}
            yAllowDecimals={false}
          />
        </ChartFrame>

        <ChartFrame title="Average latency by service">
          <SimpleBarChart
            data={stats.latencyByService}
            xKey="service"
            series={[{ dataKey: "avgMs", name: "Avg time", fill: "#386FA4" }]}
            yTickFormatter={(v) => `${v} ms`}
            tooltipFormatter={(value) => [`${Number(value)} ms`, "Avg time"]}
          />
        </ChartFrame>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <ChartFrame title="Queries by entity">
          {entityPie.length === 0 ? (
            <Text c="dimmed" size="sm">
              No queries in this period
            </Text>
          ) : (
            <PieChartWithLabel data={entityPie} height={320} />
          )}
        </ChartFrame>

        <ChartFrame
          title="Queries that cost the most"
          hint="Tile size is total response time. Click a tile to drill in. Use the path under the chart (All) to go back."
        >
          {costTree.length === 0 ? (
            <Text c="dimmed" size="sm">
              No queries in this period
            </Text>
          ) : (
            <NestableTreemap
              data={costTree}
              height={300}
              formatValue={formatMs}
              displayName={costDisplayName}
              formatTooltipDetail={(node) => {
                const count = Number(node.count ?? 0);
                const avgMs = Number(node.avgMs ?? 0);
                return `${count} queries · avg ${formatMs(avgMs)}`;
              }}
            />
          )}
        </ChartFrame>
      </SimpleGrid>
    </Stack>
  );
};
