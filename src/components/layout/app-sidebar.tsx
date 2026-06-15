"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { CalendarDays, Compass, MessageCircle, PlusCircle, Search, User, Users, Bell } from "lucide-react";
import { cn } from "../../lib/utils/cn";

const items = [
  { href: "/feed", labelKey: "feed", icon: Compass },
  { href: "/explore", labelKey: "explore", icon: Search },
  { href: "/events", labelKey: "events", icon: CalendarDays },
  { href: "/friends", labelKey: "friends", icon: Users },
  { href: "/chat", labelKey: "chat", icon: MessageCircle },
  { href: "/notifications", labelKey: "notifications", icon: Bell },
  { href: "/profile", labelKey: "profile", icon: User },
  { href: "/create", labelKey: "create", icon: PlusCircle },
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
        {items.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
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
    </aside>
  );
}
