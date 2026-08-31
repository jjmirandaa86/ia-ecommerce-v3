"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  PasswordInput,
  Stack,
  TextInput,
  Text,
  Paper,
  Group,
  Box,
} from "@mantine/core";
import { AppLoading } from "@/presentation/ui/AppLoading";

export const LoginForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rememberMe }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message ?? "Invalid credentials");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Paper p="xl" radius="md" withBorder maw={420} w="100%" pos="relative">
      {loading ? (
        <Box
          pos="absolute"
          inset={0}
          style={{
            background: "rgba(255,255,255,0.92)",
            zIndex: 2,
            borderRadius: "inherit",
          }}
        >
          <AppLoading fullScreen={false} label="Signing in…" />
        </Box>
      ) : null}
      <Stack gap="md">
        <Stack gap={6} align="center" mb="xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-ai-head.svg"
            alt="ia-ecommerce"
            width={72}
            height={92}
            style={{ display: "block" }}
          />
          <Text fw={700} size="lg" lh={1.2}>
            ia-ecommerce
          </Text>
          <Text c="dimmed" size="sm">
            Sign in to continue
          </Text>
        </Stack>
        <form onSubmit={onSubmit}>
          <Stack gap="sm">
            <TextInput
              label="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              disabled={loading}
            />
            <PasswordInput
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              disabled={loading}
            />
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.currentTarget.checked)}
              disabled={loading}
            />
            {error ? (
              <Text c="red" size="sm">
                {error}
              </Text>
            ) : null}
            <Button type="submit" fullWidth disabled={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            © 2026 ia-ecommerce
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
