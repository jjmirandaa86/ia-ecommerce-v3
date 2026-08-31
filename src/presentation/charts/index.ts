/**
 * Generic reusable Recharts — data-only building blocks.
 * Feature UIs (dashboard, agent) wrap these with titles / Paper.
 *
 * Import: `@/presentation/charts`
 */
export { DashedLineChart } from "@/presentation/charts/DashedLineChart";
export type {
  DashedLineChartProps,
  DashedLineSeries,
} from "@/presentation/charts/DashedLineChart";

export { SimpleBarChart } from "@/presentation/charts/SimpleBarChart";
export type {
  SimpleBarChartProps,
  SimpleBarSeries,
} from "@/presentation/charts/SimpleBarChart";

export { PieChartWithLabel } from "@/presentation/charts/PieChartWithLabel";
export type {
  PieChartDatum,
  PieChartWithLabelProps,
} from "@/presentation/charts/PieChartWithLabel";

export { SimpleRadialBarChart } from "@/presentation/charts/SimpleRadialBarChart";
export type {
  RadialBarDatum,
  SimpleRadialBarChartProps,
} from "@/presentation/charts/SimpleRadialBarChart";

export { NestableTreemap } from "@/presentation/charts/NestableTreemap";
export type {
  NestableTreemapNode,
  NestableTreemapProps,
} from "@/presentation/charts/NestableTreemap";

export {
  CHART_BAR,
  CHART_COLORS,
  CHART_GRID,
  CHART_STROKE,
  CHART_TICK,
  DEFAULT_CHART_HEIGHT,
} from "@/presentation/charts/theme";
