import type { ReactNode } from "react";

export type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return <main className="min-h-screen bg-hm-luxuryBlack text-hm-textPrimary">{children}</main>;
}

