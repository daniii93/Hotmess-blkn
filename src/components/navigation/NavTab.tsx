"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { House, Search, Send, SquarePlay } from "lucide-react";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "./navItems";
import { NavBadge } from "./NavBadge";

type NavTabProps = {
  item: NavItem;
  active: boolean;
  href: string;
  avatarUrl: string | null;
  initials: string;
  badgeCount?: number;
  badgeDot?: boolean;
  onPress: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function NavTab({ item, active, href, avatarUrl, initials, badgeCount, badgeDot, onPress }: NavTabProps) {
  return (
    <Link
      href={href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      onClick={onPress}
      className={cn(
        "relative flex h-12 min-h-11 min-w-11 flex-1 items-center justify-center rounded-full text-hm-inkSoft outline-none transition-transform duration-120 ease-out focus-visible:ring-2 focus-visible:ring-hm-gold focus-visible:ring-offset-2 focus-visible:ring-offset-hm-ivory active:scale-[0.92]",
        active && "text-hm-ink",
      )}
    >
      {active && (
        <motion.span
          layoutId="bottomNavActivePill"
          className="absolute inset-1 rounded-full bg-hm-champagne/90"
          transition={{ type: "spring", stiffness: 520, damping: 36 }}
        />
      )}
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full">
        <Icon item={item} active={active} avatarUrl={avatarUrl} initials={initials} />
        <NavBadge count={badgeCount} dot={badgeDot} />
      </span>
    </Link>
  );
}

function Icon({ item, active, avatarUrl, initials }: { item: NavItem; active: boolean; avatarUrl: string | null; initials: string }) {
  const iconClass = "h-[23px] w-[23px] transition-all duration-150";
  const strokeWidth = active ? 2.2 : 1.8;
  const fill = active ? "currentColor" : "none";

  if (item.icon === "avatar") {
    if (avatarUrl) {
      return <img src={avatarUrl} alt="" className={cn("h-8 w-8 rounded-full object-cover ring-1", active ? "ring-hm-ink" : "ring-hm-gold/30")} />;
    }
    return (
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-hm-champagne text-[11px] font-semibold", active ? "text-hm-ink ring-1 ring-hm-ink" : "text-hm-inkSoft ring-1 ring-hm-gold/30")}>
        {initials}
      </span>
    );
  }

  if (item.icon === "home") return <House className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  if (item.icon === "play") return <SquarePlay className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  if (item.icon === "send") return <Send className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  return <Search className={iconClass} strokeWidth={strokeWidth} aria-hidden="true" />;
}

