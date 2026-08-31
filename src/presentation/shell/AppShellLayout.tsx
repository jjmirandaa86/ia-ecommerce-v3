"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Text,
  Menu,
  Avatar,
  UnstyledButton,
  Stack,
  Loader,
  Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiGrid,
  FiMessageSquare,
  FiActivity,
  FiLogOut,
  FiChevronDown,
  FiUser,
  FiBriefcase,
  FiLayers,
  FiShield,
} from "react-icons/fi";
import type { ReactNode } from "react";

export type SessionProfile = {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    department: string | null;
    roles: Array<{ code: string; name: string }>;
  };
  company: {
    id: string;
    name: string;
    systemType: string;
    hostKey: string;
  };
};

const initialsFrom = (name: string) => {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const AppShellLayout = ({ children }: { children: ReactNode }) => {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          router.replace("/login");
          return;
        }
        if (!cancelled) setProfile(json.data as SessionProfile);
      } catch {
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  if (loading || !profile) {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }

  const label = profile.user.displayName || profile.user.username;
  const initials = initialsFrom(label);
  const roleNames =
    profile.user.roles.length > 0
      ? profile.user.roles.map((r) => r.name).join(", ")
      : "—";

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap={8} wrap="nowrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo-ai-head.svg"
                alt=""
                width={28}
                height={36}
                style={{ display: "block" }}
                aria-hidden
              />
              <Text fw={700}>ia-ecommerce</Text>
            </Group>
          </Group>
          <Menu shadow="md" width={280} position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Stack gap={0} align="flex-end" visibleFrom="sm">
                    <Text size="sm" fw={600} lh={1.2}>
                      {label}
                    </Text>
                    <Text size="xs" c="dimmed" lh={1.2}>
                      {profile.company.name}
                    </Text>
                  </Stack>
                  <Avatar color="blue" radius="xl" size={32}>
                    {initials}
                  </Avatar>
                  <FiChevronDown />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item leftSection={<FiUser size={14} />} closeMenuOnClick={false}>
                <Stack gap={0}>
                  <Text size="sm" fw={600}>
                    {label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    @{profile.user.username}
                  </Text>
                </Stack>
              </Menu.Item>
              <Menu.Item
                leftSection={<FiBriefcase size={14} />}
                closeMenuOnClick={false}
              >
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    Company
                  </Text>
                  <Text size="sm">{profile.company.name}</Text>
                </Stack>
              </Menu.Item>
              <Menu.Item
                leftSection={<FiLayers size={14} />}
                closeMenuOnClick={false}
              >
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    Department
                  </Text>
                  <Text size="sm">{profile.user.department ?? "—"}</Text>
                </Stack>
              </Menu.Item>
              <Menu.Item
                leftSection={<FiShield size={14} />}
                closeMenuOnClick={false}
              >
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    Role
                  </Text>
                  <Text size="sm">{roleNames}</Text>
                </Stack>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<FiLogOut />}
                onClick={() => void signOut()}
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Text size="xs" c="dimmed" tt="uppercase" mb="sm">
          Overview
        </Text>
        <Stack gap={4}>
          <NavLink
            component={Link}
            href="/dashboard"
            label="Dashboard"
            leftSection={<FiGrid />}
            active={pathname === "/dashboard"}
          />
          <NavLink
            component={Link}
            href="/agent"
            label="SQL Agent"
            description="Intent JSON + safe SQL"
            leftSection={<FiMessageSquare />}
            active={pathname === "/agent"}
          />
          <NavLink
            component={Link}
            href="/health"
            label="Health"
            description="Services UP / DOWN"
            leftSection={<FiActivity />}
            active={pathname === "/health"}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
