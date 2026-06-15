import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import type { UserRole } from "../../types/roles";

export type AppShellProps = {
  children: ReactNode;
  role: UserRole;
  currentPath: string;
  variant?: "member" | "admin" | "scanner";
  className?: string;
};

const cx = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(" ");

export function AppShell({ children, role, currentPath, variant = "member", className }: AppShellProps) {
  return (
    <div
      data-shell-variant={variant}
      className={cx(
        "min-h-screen bg-hm-luxuryBlack text-hm-textPrimary",
        variant === "admin" && "bg-hm-luxuryBlack",
        variant === "scanner" && "bg-hm-black",
        className,
      )}
    >
      <main className={cx("pb-24", variant === "scanner" ? "px-3 py-4" : "px-4 py-6 md:px-8")}>{children}</main>
      {variant === "member" ? <BottomNav role={role} currentPath={currentPath} /> : null}
    </div>
  );
}
