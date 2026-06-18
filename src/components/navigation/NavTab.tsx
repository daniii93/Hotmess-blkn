"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Briefcase, CalendarDays, Compass, Gift, Send, Sparkles, Wrench } from "lucide-react";
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
        "relative flex h-12 min-h-11 w-[4.4rem] flex-none items-center justify-center rounded-full text-hm-inkSoft outline-none transition-transform duration-120 ease-out focus-visible:ring-2 focus-visible:ring-hm-gold focus-visible:ring-offset-2 focus-visible:ring-offset-hm-ivory active:scale-[0.92] sm:flex-1",
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

function Icon({ item, active }: { item: NavItem; active: boolean; avatarUrl: string | null; initials: string }) {
  const iconClass = "h-[23px] w-[23px] transition-all duration-150";
  const strokeWidth = active ? 2.2 : 1.8;
  const fill = active ? "currentColor" : "none";

  if (item.icon === "compass") return <Compass className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  if (item.icon === "calendar") return <CalendarDays className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  if (item.icon === "send") return <Send className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  if (item.icon === "briefcase") return <Briefcase className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  if (item.icon === "wrench") return <Wrench className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  if (item.icon === "gift") return <Gift className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  if (item.icon === "sparkles") return <Sparkles className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
  return <Bot className={iconClass} strokeWidth={strokeWidth} fill={fill} aria-hidden="true" />;
}
