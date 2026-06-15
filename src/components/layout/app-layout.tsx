import type { ReactNode } from "react";
import { AppShell } from "./app-shell";

export type AppLayoutProps = {
  children: ReactNode;
  currentPath: string;
};

export function AppLayout({ children, currentPath }: AppLayoutProps) {
  return (
    <AppShell role="user" currentPath={currentPath} variant="member">
      {children}
    </AppShell>
  );
}

