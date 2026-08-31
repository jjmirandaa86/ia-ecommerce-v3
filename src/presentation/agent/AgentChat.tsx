"use client";

import { useState, type ReactNode } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  TextInput,
  Button,
  Group,
  Code,
  ScrollArea,
  Avatar,
  Box,
  ActionIcon,
  Popover,
  Menu,
  Table,
} from "@mantine/core";
import {
  FiSend,
  FiZap,
  FiUser,
  FiInfo,
  FiChevronRight,
  FiPackage,
  FiArrowLeft,
  FiHash,
  FiGrid,
  FiLayers,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiAlertCircle,
  FiDroplet,
  FiBarChart2,
  FiMessageSquare,
  FiStar,
  FiThumbsDown,
  FiClock,
  FiShoppingCart,
  FiList,
  FiUsers,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string | null;
  intentJson?: Record<string, unknown> | null;
  classifySource?: string | null;
  durationMs?: number | null;
  columns?: string[];
  rows?: Record<string, unknown>[];
};

type TipItem = {
  text: string;
  icon: ReactNode;
};

/** Tips menu: entity → example questions. */
const TIP_ENTITIES: Array<{
  key: string;
  label: string;
  icon: ReactNode;
  tips: TipItem[];
}> = [
  {
    key: "product",
    label: "Products",
    icon: <FiPackage size={14} />,
    tips: [
      {
        text: "How many products are there?",
        icon: <FiHash size={14} />,
      },
      {
        text: "How many products are there per category?",
        icon: <FiGrid size={14} />,
      },
      {
        text: "How many products are there per subcategory?",
        icon: <FiLayers size={14} />,
      },
      {
        text: "What are the top 10 most expensive products?",
        icon: <FiTrendingUp size={14} />,
      },
      {
        text: "What are the cheapest products under $50?",
        icon: <FiDollarSign size={14} />,
      },
      {
        text: "How many products have no subcategory?",
        icon: <FiAlertCircle size={14} />,
      },
      {
        text: "List products by color",
        icon: <FiDroplet size={14} />,
      },
      {
        text: "What is the average list price by category?",
        icon: <FiBarChart2 size={14} />,
      },
    ],
  },
  {
    key: "review",
    label: "Reviews",
    icon: <FiMessageSquare size={14} />,
    tips: [
      {
        text: "How many products have reviews?",
        icon: <FiHash size={14} />,
      },
      {
        text: "How many reviews are there?",
        icon: <FiMessageSquare size={14} />,
      },
      {
        text: "What is the average product rating?",
        icon: <FiBarChart2 size={14} />,
      },
      {
        text: "Which products have the highest average rating?",
        icon: <FiStar size={14} />,
      },
      {
        text: "Which products have the lowest average rating?",
        icon: <FiThumbsDown size={14} />,
      },
      {
        text: "What is the worst product review?",
        icon: <FiAlertCircle size={14} />,
      },
      {
        text: "Show the latest product reviews",
        icon: <FiClock size={14} />,
      },
      {
        text: "How many reviews have a 5-star rating?",
        icon: <FiStar size={14} />,
      },
    ],
  },
  {
    key: "salesorderheader",
    label: "Orders",
    icon: <FiShoppingCart size={14} />,
    tips: [
      {
        text: "What was the last sale?",
        icon: <FiClock size={14} />,
      },
      {
        text: "What was the most recent order?",
        icon: <FiClock size={14} />,
      },
      {
        text: "How many sales orders are there?",
        icon: <FiHash size={14} />,
      },
      {
        text: "What was the sales value over the last 3 months?",
        icon: <FiDollarSign size={14} />,
      },
      {
        text: "Sales value over the last 6 months",
        icon: <FiDollarSign size={14} />,
      },
      {
        text: "What is the average order value?",
        icon: <FiBarChart2 size={14} />,
      },
      {
        text: "What is the minimum order value?",
        icon: <FiTrendingDown size={14} />,
      },
      {
        text: "What is the maximum order value?",
        icon: <FiTrendingUp size={14} />,
      },
      {
        text: "Sales orders by year",
        icon: <FiGrid size={14} />,
      },
      {
        text: "Sales orders by year order by orderCount",
        icon: <FiTrendingDown size={14} />,
      },
    ],
  },
  {
    key: "salesorderdetail",
    label: "Order details",
    icon: <FiList size={14} />,
    tips: [
      {
        text: "What are the top selling products?",
        icon: <FiTrendingUp size={14} />,
      },
      {
        text: "What are the least sold products?",
        icon: <FiAlertCircle size={14} />,
      },
      {
        text: "How many order lines are there?",
        icon: <FiHash size={14} />,
      },
      {
        text: "Quantity sold by product",
        icon: <FiBarChart2 size={14} />,
      },
    ],
  },
  {
    key: "customer",
    label: "Customers",
    icon: <FiUsers size={14} />,
    tips: [
      {
        text: "How many customers do I have?",
        icon: <FiHash size={14} />,
      },
      {
        text: "Show the top 10 customers by sales",
        icon: <FiTrendingUp size={14} />,
      },
      {
        text: "Which customers spend the most in category Bikes?",
        icon: <FiDollarSign size={14} />,
      },
      {
        text: "How many store customers are there?",
        icon: <FiUsers size={14} />,
      },
      {
        text: "How many customers have no orders?",
        icon: <FiAlertCircle size={14} />,
      },
      {
        text: "What is the average customer spend?",
        icon: <FiBarChart2 size={14} />,
      },
      {
        text: "Customers with spend over 10000",
        icon: <FiDollarSign size={14} />,
      },
      {
        text: "Show customer 11000",
        icon: <FiHash size={14} />,
      },
      {
        text: "Customers that have first name Michelle",
        icon: <FiUsers size={14} />,
      },
      {
        text: "show me order of customers that name like miranda, show me sales last 1 year",
        icon: <FiDollarSign size={14} />,
      },
      {
        text: "Give products name Tire that sales in last 2 year and customer have names like Miranda",
        icon: <FiDollarSign size={14} />,
      },
      {
        text: "Customer with email michelle2@adventure-works.com",
        icon: <FiUsers size={14} />,
      },
      {
        text: "Show customer 26235",
        icon: <FiHash size={14} />,
      },
      {
        text: "Compare store versus individual customer spend",
        icon: <FiBarChart2 size={14} />,
      },
    ],
  },
];

const DebugInfoButton = ({
  intentJson,
  sql,
  classifySource,
}: {
  intentJson?: Record<string, unknown> | null;
  sql?: string | null;
  classifySource?: string | null;
}) => {
  if (!intentJson && !sql) return null;

  return (
    <Popover width={360} position="bottom-start" withArrow shadow="md">
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          radius="xl"
          aria-label="Show intent JSON and SQL"
        >
          <FiInfo size={14} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          {classifySource ? (
            <Text size="xs" c="dimmed">
              Classifier: {classifySource}
            </Text>
          ) : null}
          {intentJson ? (
            <div>
              <Text size="xs" fw={600} mb={4}>
                LLM intent JSON
              </Text>
              <Code block style={{ fontSize: 11, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(intentJson, null, 2)}
              </Code>
            </div>
          ) : null}
          {sql ? (
            <div>
              <Text size="xs" fw={600} mb={4}>
                SQL query
              </Text>
              <Code block style={{ fontSize: 11, whiteSpace: "pre-wrap" }}>
                {sql}
              </Code>
            </div>
          ) : null}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

const ResultTable = ({
  columns,
  rows,
}: {
  columns: string[];
  rows: Record<string, unknown>[];
}) => {
  if (!rows.length || !columns.length) return null;
  return (
    <Table
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders
      fz="xs"
      mt={4}
    >
      <Table.Thead>
        <Table.Tr>
          {columns.map((c) => (
            <Table.Th key={c}>{c}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row, i) => (
          <Table.Tr key={i}>
            {columns.map((c) => (
              <Table.Td key={c}>{String(row[c] ?? "")}</Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

export const AgentChat = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [tipEntityKey, setTipEntityKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi. Ask about products, reviews, sales, or customers. Use Tips for ideas.",
    },
  ]);

  const tipEntity = TIP_ENTITIES.find((e) => e.key === tipEntityKey) ?? null;

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;

    setLoading(true);
    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: message },
    ]);

    try {
      const res = await fetch("/api/agent/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Request failed");
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              json?.error?.message ??
              "I could not complete that query. Please try again.",
          },
        ]);
        return;
      }

      const data = json.data;
      if (data.status === "matched") {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.answer,
            sql: data.sql,
            intentJson: data.intentJson ?? {
              intent: data.intentName,
              filters: {},
            },
            classifySource: data.meta?.classifySource ?? null,
            durationMs: data.meta?.durationMs ?? null,
            columns: data.columns,
            rows: data.rows,
          },
        ]);
      } else {
        const tips = (data.suggestions ?? [])
          .map((s: { text: string }) => `• ${s.text}`)
          .join("\n");
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: tips
              ? `${data.answer}\n\nTry:\n${tips}`
              : data.answer,
            intentJson: { intent: "no_match", filters: {} },
            durationMs: data.meta?.durationMs ?? null,
          },
        ]);
      }
    } catch {
      setError("Unable to reach the agent.");
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Unable to reach the agent.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md" h="calc(100vh - 100px)">
      <div>
        <Title order={2}>SQL Agent</Title>
        <Text c="dimmed" size="sm">
          Intent JSON + safe SQL
        </Text>
      </div>

      <Paper
        withBorder
        radius="md"
        p="md"
        style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <ScrollArea style={{ flex: 1 }} offsetScrollbars>
          <Stack gap="md" pr="xs">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <Group
                  key={m.id}
                  align="flex-start"
                  gap="sm"
                  wrap="nowrap"
                  justify={isUser ? "flex-end" : "flex-start"}
                >
                  {!isUser ? (
                    <Avatar
                      radius="xl"
                      size={36}
                      color="blue"
                      variant="light"
                      style={{ flexShrink: 0 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/logo-ai-head.svg"
                        alt=""
                        width={22}
                        height={28}
                        style={{ display: "block" }}
                        aria-hidden
                      />
                    </Avatar>
                  ) : null}

                  <Box maw={640} style={{ minWidth: 0, flex: "0 1 auto" }}>
                    <Group
                      gap={6}
                      mb={4}
                      justify={isUser ? "flex-end" : "flex-start"}
                    >
                      <Text size="xs" c="dimmed" fw={600}>
                        {isUser ? "You" : "IA Agent"}
                      </Text>
                      {!isUser ? (
                        <HiOutlineSparkles
                          size={12}
                          color="var(--mantine-color-blue-6)"
                        />
                      ) : null}
                    </Group>
                    <Group align="flex-start" gap={6} wrap="nowrap">
                      <Paper
                        p="sm"
                        radius="md"
                        bg={isUser ? "gray.1" : "blue.0"}
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <Stack gap={6}>
                          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                            {m.content}
                          </Text>
                          {!isUser &&
                          m.rows &&
                          m.columns &&
                          m.rows.length > 0 &&
                          m.columns.length > 1 ? (
                            <ResultTable columns={m.columns} rows={m.rows} />
                          ) : null}
                          {!isUser && m.durationMs != null ? (
                            <Text size="xs" c="dimmed">
                              Completed in{" "}
                              {m.durationMs >= 1000
                                ? `${(m.durationMs / 1000).toFixed(2)} s`
                                : `${m.durationMs} ms`}
                            </Text>
                          ) : null}
                        </Stack>
                      </Paper>
                      {!isUser ? (
                        <DebugInfoButton
                          intentJson={m.intentJson}
                          sql={m.sql}
                          classifySource={m.classifySource}
                        />
                      ) : null}
                    </Group>
                  </Box>

                  {isUser ? (
                    <Avatar
                      radius="xl"
                      size={36}
                      color="gray"
                      variant="filled"
                      style={{ flexShrink: 0 }}
                    >
                      <FiUser size={18} />
                    </Avatar>
                  ) : null}
                </Group>
              );
            })}
          </Stack>
        </ScrollArea>
      </Paper>

      {error ? (
        <Text c="red" size="sm">
          {error}
        </Text>
      ) : null}

      <Group align="flex-end" wrap="nowrap">
        <TextInput
          placeholder="e.g. How many products are there?"
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send(input);
          }}
          disabled={loading}
          autoFocus
        />
        <Menu
          shadow="md"
          width={300}
          position="top-end"
          withinPortal
          opened={tipsOpen}
          onChange={(opened) => {
            setTipsOpen(opened);
            if (!opened) setTipEntityKey(null);
          }}
          closeOnItemClick={false}
        >
          <Menu.Target>
            <Button
              variant="light"
              color="yellow"
              leftSection={<FiZap />}
              disabled={loading}
            >
              Tips
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {!tipEntity ? (
              <>
                <Menu.Label>Entities</Menu.Label>
                {TIP_ENTITIES.map((entity) => (
                  <Menu.Item
                    key={entity.key}
                    leftSection={entity.icon}
                    rightSection={<FiChevronRight size={14} />}
                    onClick={() => setTipEntityKey(entity.key)}
                  >
                    {entity.label}
                  </Menu.Item>
                ))}
              </>
            ) : (
              <>
                <Menu.Item
                  leftSection={<FiArrowLeft size={14} />}
                  onClick={() => setTipEntityKey(null)}
                >
                  Back
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>{tipEntity.label} ideas</Menu.Label>
                {tipEntity.tips.map((tip) => (
                  <Menu.Item
                    key={tip.text}
                    leftSection={tip.icon}
                    onClick={() => {
                      setTipsOpen(false);
                      setTipEntityKey(null);
                      void send(tip.text);
                    }}
                    style={{ whiteSpace: "normal", lineHeight: 1.35 }}
                  >
                    {tip.text}
                  </Menu.Item>
                ))}
              </>
            )}
          </Menu.Dropdown>
        </Menu>
        <Button
          leftSection={<FiSend />}
          loading={loading}
          onClick={() => void send(input)}
          disabled={!input.trim()}
        >
          Send
        </Button>
      </Group>
    </Stack>
  );
}
