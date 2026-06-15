import type { ReactNode } from "react";
import { AppShell } from "./app-shell";

export type AdminLayoutProps = {
  children: ReactNode;
  currentPath: string;
};

export function AdminLayout({ children, currentPath }: AdminLayoutProps) {
  return (
    <AppShell role="admin" currentPath={currentPath} variant="admin">
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </AppShell>
  );
}

