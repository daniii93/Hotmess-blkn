"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bot, Briefcase, CalendarDays, Compass, Gift, Send, Sparkles, Wrench } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { cn } from "../../lib/utils/cn";

const items = [
  { href: "/discover", labelKey: "discover", icon: Compass, aliases: ["/feed", "/watch", "/explore", "/explore/people"] },
  { href: "/events", labelKey: "events", icon: CalendarDays, aliases: [] },
  { href: "/chat", labelKey: "connect", icon: Send, aliases: ["/friends", "/dating", "/business/coffee", "/business/groups"] },
  { href: "/business", labelKey: "business", icon: Briefcase, aliases: [] },
  { href: "/services", labelKey: "services", icon: Wrench, aliases: ["/local-services", "/checkout/local-services"] },
  { href: "/benefits", labelKey: "benefits", icon: Gift, aliases: [] },
  { href: "/creator", labelKey: "creator", icon: Sparkles, aliases: [] },
  { href: "/digital-ai", labelKey: "digitalAi", icon: Bot, aliases: [] },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav.app");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-hm-border bg-hm-porcelain/95 px-5 py-6 shadow-soft backdrop-blur lg:block">
      <Link href="/feed" className="mb-10 flex items-center gap-3 rounded-pill focus-visible:outline-hm-gold">
        <Image src="/hotmess-logo-mark.svg" alt="HotMess" width={44} height={44} priority />
      </Link>
      <nav className="space-y-2" aria-label="App Navigation">
        {items.map(({ href, labelKey, icon: Icon, aliases }) => {
          const paths = [href, ...(aliases ?? [])];
          const active = paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-pill px-4 py-3 text-sm font-medium text-hm-inkSoft transition hover:bg-hm-champagne hover:text-hm-ink",
                active && "bg-hm-ink text-hm-porcelain hover:bg-hm-ink hover:text-hm-porcelain",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute inset-x-5 bottom-6">
        <LogoutButton compact />
      </div>
    </aside>
  );
}
