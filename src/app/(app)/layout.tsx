import type { ReactNode } from "react";
import { AppShellLayout } from "@/presentation/shell/AppShellLayout";

const AppGroupLayout = ({ children }: { children: ReactNode }) => {
  return <AppShellLayout>{children}</AppShellLayout>;
};
export default AppGroupLayout;
