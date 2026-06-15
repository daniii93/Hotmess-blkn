"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "../../lib/utils/cn";

type SubnavItem = {
  href: string;
  labelKey: string;
};

type ModeSubnavProps = {
  namespace: "nav.dating" | "nav.business" | "nav.admin";
  items: readonly SubnavItem[];
  accentClass?: string;
};

export function ModeSubnav({ namespace, items, accentClass = "text-hm-goldDeep" }: ModeSubnavProps) {
  const pathname = usePathname();
  const t = useTranslations(namespace);

  return (
    <nav className="sticky top-0 z-20 border-b border-hm-border bg-hm-ivory/90 px-4 py-3 backdrop-blur" aria-label="Sub Navigation">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-pill border border-transparent px-4 py-2 text-sm font-medium text-hm-inkSoft transition hover:border-hm-border hover:bg-hm-porcelain",
                active && `border-hm-border bg-hm-porcelain ${accentClass}`,
              )}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
