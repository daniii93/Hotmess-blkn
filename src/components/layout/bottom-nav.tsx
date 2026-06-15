import { navigationForRole, type NavigationItem } from "../../config/navigation";
import type { UserRole } from "../../types/roles";

export type BottomNavProps = {
  role: UserRole;
  currentPath: string;
  items?: readonly NavigationItem[];
  className?: string;
};

const cx = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(" ");

export function BottomNav({ role, currentPath, items, className }: BottomNavProps) {
  const navItems = items ?? navigationForRole(role);

  return (
    <nav
      aria-label="Primary mobile navigation"
      className={cx(
        "fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-card border border-hm-glassBorder bg-hm-luxuryBlack/90 p-2 shadow-luxury backdrop-blur-xl md:hidden",
        className,
      )}
    >
      {navItems.slice(0, 5).map((item) => {
        const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

        return (
          <a
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex min-h-11 flex-col items-center justify-center rounded-luxury px-2 text-[0.68rem] font-semibold transition",
              active ? "text-hm-champagne" : "text-hm-textMuted hover:text-hm-textPrimary",
            )}
          >
            <span aria-hidden="true" className="mb-1 h-1.5 w-1.5 rounded-full bg-current" />
            <span>{item.labelKey}</span>
          </a>
        );
      })}
    </nav>
  );
}
