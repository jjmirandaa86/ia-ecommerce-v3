"use client";

import { useEffect, useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Badge,
  Group,
  Button,
  Loader,
} from "@mantine/core";
import { FiRefreshCw } from "react-icons/fi";

type ServiceStatus = "up" | "down" | "n/a";

type ServiceCheck = {
  status: ServiceStatus;
  latencyMs?: number;
  detail?: string;
  engine?: string;
};

type HealthData = {
  app: ServiceCheck;
  productDatabase: ServiceCheck;
  llm: ServiceCheck;
  clientDatabase: ServiceCheck;
};

const LABELS: { key: keyof HealthData; name: string }[] = [
  { key: "app", name: "App" },
  { key: "productDatabase", name: "Product database" },
  { key: "llm", name: "LLM" },
  { key: "clientDatabase", name: "Client database" },
];

const badgeColor = (status: ServiceStatus) => {
  if (status === "up") return "green";
  if (status === "down") return "red";
  return "gray";
}

export const HealthPanel = () => {
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Health check failed");
        setData(null);
        return;
      }
      setData(json.data as HealthData);
    } catch {
      setError("Unable to reach /api/health");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Health</Title>
          <Text c="dimmed" size="sm">
            Live status from GET /api/health
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

      {LABELS.map(({ key, name }) => {
        const service = data?.[key];
        const status = service?.status ?? (loading ? "n/a" : "down");
        const meta = [
          service?.latencyMs != null ? `${service.latencyMs} ms` : null,
          service?.engine ?? null,
          service?.detail ?? null,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <Paper key={key} p="md" withBorder radius="md">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={500}>{name}</Text>
                {meta ? (
                  <Text size="xs" c="dimmed">
                    {meta}
                  </Text>
                ) : null}
              </div>
              <Badge color={badgeColor(status)}>{status.toUpperCase()}</Badge>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}
