import { Center, Stack, Text } from "@mantine/core";

type AppLoadingProps = {
  fullScreen?: boolean;
  label?: string;
};

export const AppLoading = ({
  fullScreen = true,
  label = "Loading…",
}: AppLoadingProps) => {
  return (
    <Center h={fullScreen ? "100vh" : "100%"} mih={fullScreen ? undefined : 200} p="md">
      <Stack align="center" gap="sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/Loading.svg"
          alt=""
          width={72}
          height={72}
          aria-hidden
        />
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Stack>
    </Center>
  );
}
