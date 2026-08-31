import { Box, Center, Flex } from "@mantine/core";
import Image from "next/image";
import { LoginForm } from "@/presentation/auth/LoginForm";

const LoginPage = () => {
  return (
    <Flex mih="100vh">
      <Center flex={1} p="md" bg="gray.0" mih="100vh">
        <LoginForm />
      </Center>

      <Box
        visibleFrom="md"
        pos="relative"
        flex={1}
        mih="100vh"
        style={{ minWidth: 0 }}
      >
        <Image
          src="/assets/login-ai-ecommerce-hero.jpg"
          alt="IA ecommerce analytics"
          fill
          priority
          sizes="50vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </Box>
    </Flex>
  );
};
export default LoginPage;
