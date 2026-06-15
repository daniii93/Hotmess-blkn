import type { ReactNode } from "react";
import { AppShell } from "./app-shell";

export type ScannerLayoutProps = {
  children: ReactNode;
  currentPath: string;
};

export function ScannerLayout({ children, currentPath }: ScannerLayoutProps) {
  return (
    <AppShell role="scanner" currentPath={currentPath} variant="scanner">
      {children}
    </AppShell>
  );
}

