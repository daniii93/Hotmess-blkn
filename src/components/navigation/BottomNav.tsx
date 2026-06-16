"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { NavTab } from "./NavTab";
import { getNavItemForPath, navItems } from "./navItems";
import { resetActiveTab, restoreScrollForPath, useRememberCurrentTab, useTabStackStore } from "./useTabStacks";
import { useNavBadges } from "./useNavBadges";

const hiddenExact = new Set(["/scanner"]);
const hiddenPrefixes = ["/admin", "/feed/stories/", "/events/"];

const shouldHideForPath = (pathname: string) => {
  if (hiddenExact.has(pathname)) return true;
  if (pathname.includes("/checkout")) return true;
  if (/^\/chat\/[^/]+/.test(pathname)) return true;
  return hiddenPrefixes.some((prefix) => pathname.startsWith(prefix) && (prefix !== "/events/" || pathname.includes("/checkout")));
};

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [hiddenByScroll, setHiddenByScroll] = useState(false);
  const badges = useNavBadges();
  const activeItem = getNavItemForPath(pathname);
  const getSavedPath = useTabStackStore((state) => state.getPath);
  const rememberScroll = useTabStackStore((state) => state.rememberScroll);

  useRememberCurrentTab(pathname);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nextY = window.scrollY;
        if (nextY < 24) setHiddenByScroll(false);
        else if (nextY > lastY + 8) setHiddenByScroll(true);
        else if (nextY < lastY - 4) setHiddenByScroll(false);
        lastY = nextY;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const liveText = useMemo(() => {
    const parts = [];
    if (badges.unreadMessages) parts.push(`${badges.unreadMessages} ungelesene Nachrichten`);
    if (badges.hasUnreadNotifications) parts.push("neue Benachrichtigungen");
    return parts.join(", ");
  }, [badges.hasUnreadNotifications, badges.unreadMessages]);

  if (shouldHideForPath(pathname)) return null;

  return (
    <>
      <p className="sr-only" aria-live="polite">{liveText}</p>
      <nav
        aria-label="Hauptnavigation"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] transition-transform duration-200 md:hidden",
          hiddenByScroll ? "translate-y-[120%]" : "translate-y-0",
        )}
      >
        <div className="flex w-full max-w-[420px] items-center justify-between rounded-full border border-hm-gold/25 bg-white/85 p-1.5 shadow-[0_8px_30px_rgba(28,25,21,0.10)] backdrop-blur-[20px]">
          {navItems.map((item) => {
            const active = activeItem?.key === item.key;
            const target = active ? item.href : getSavedPath(item.key, item.href);
            const badgeCount = item.key === "inbox" ? badges.unreadMessages : undefined;
            const badgeDot = item.key === "profile" ? badges.hasUnreadNotifications : item.key === "watch" ? badges.hasNewWatch : false;
            return (
              <NavTab
                key={item.key}
                item={item}
                active={active}
                href={target}
                avatarUrl={badges.avatarUrl}
                initials={badges.initials}
                badgeCount={badgeCount}
                badgeDot={badgeDot}
                onPress={(event) => {
                  rememberScroll(pathname, window.scrollY);
                  if (active) {
                    event.preventDefault();
                    resetActiveTab(pathname, item.href, router.push);
                    return;
                  }
                  window.requestAnimationFrame(() => restoreScrollForPath(target));
                }}
              />
            );
          })}
        </div>
      </nav>
    </>
  );
}

