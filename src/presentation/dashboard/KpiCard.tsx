"use client";

import { Card, Group, Stack, Text } from "@mantine/core";
import {
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiDatabase,
  FiSearch,
} from "react-icons/fi";

export type KpiTone = "queries" | "success" | "response" | "llm" | "database";

export type KpiCardItem = {
  label: string;
  value: string;
  hint: string;
  tone: KpiTone;
};

const TONE: Record<
  KpiTone,
  { bg: string; ink: string; muted: string; icon: typeof FiSearch }
> = {
  queries: {
    bg: "#59A5D8",
    ink: "#FFFFFF",
    muted: "rgba(255,255,255,0.88)",
    icon: FiSearch,
  },
  success: {
    bg: "#84D2F6",
    ink: "#133C55",
    muted: "rgba(19,60,85,0.72)",
    icon: FiCheckCircle,
  },
  response: {
    bg: "#91E5F6",
    ink: "#133C55",
    muted: "rgba(19,60,85,0.72)",
    icon: FiClock,
  },
  llm: {
    bg: "#386FA4",
    ink: "#FFFFFF",
    muted: "rgba(255,255,255,0.88)",
    icon: FiCpu,
  },
  database: {
    bg: "#133C55",
    ink: "#FFFFFF",
    muted: "rgba(255,255,255,0.88)",
    icon: FiDatabase,
  },
};

export const KpiCard = ({ item }: { item: KpiCardItem }) => {
  const tone = TONE[item.tone];
  const Icon = tone.icon;

  return (
    <Card
      padding="lg"
      radius="lg"
      shadow="sm"
      withBorder={false}
      style={{
        backgroundColor: tone.bg,
        color: tone.ink,
        boxShadow: "0 8px 22px rgba(13, 37, 63, 0.12)",
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text
            size="xs"
            fw={700}
            tt="uppercase"
            style={{ color: tone.muted, letterSpacing: "0.04em" }}
          >
            {item.label}
          </Text>
          <Icon size={18} />
        </Group>
        <Text fw={800} size="xl" style={{ color: tone.ink, lineHeight: 1.1 }}>
          {item.value}
        </Text>
        <Text size="xs" style={{ color: tone.muted }}>
          {item.hint}
        </Text>
      </Stack>
    </Card>
  );
}
