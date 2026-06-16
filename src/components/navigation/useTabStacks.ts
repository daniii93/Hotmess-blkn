"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { NavItemKey } from "./navItems";
import { getNavItemForPath } from "./navItems";

type TabStackState = {
  paths: Partial<Record<NavItemKey, string>>;
  scroll: Record<string, number>;
  rememberPath: (key: NavItemKey, path: string) => void;
  rememberScroll: (path: string, y: number) => void;
  getPath: (key: NavItemKey, fallback: string) => string;
  getScroll: (path: string) => number;
};

export const useTabStackStore = create<TabStackState>((set, get) => ({
  paths: {},
  scroll: {},
  rememberPath: (key, path) => set((state) => ({ paths: { ...state.paths, [key]: path } })),
  rememberScroll: (path, y) => set((state) => ({ scroll: { ...state.scroll, [path]: y } })),
  getPath: (key, fallback) => get().paths[key] ?? fallback,
  getScroll: (path) => get().scroll[path] ?? 0,
}));

export function useRememberCurrentTab(pathname: string) {
  const rememberPath = useTabStackStore((state) => state.rememberPath);
  const rememberScroll = useTabStackStore((state) => state.rememberScroll);

  useEffect(() => {
    const item = getNavItemForPath(pathname);
    if (item) rememberPath(item.key, pathname);
  }, [pathname, rememberPath]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => rememberScroll(pathname, window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      rememberScroll(pathname, window.scrollY);
    };
  }, [pathname, rememberScroll]);
}

export function restoreScrollForPath(pathname: string) {
  const y = useTabStackStore.getState().getScroll(pathname);
  if (y > 0) window.requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" }));
}

export function resetActiveTab(pathname: string, rootHref: string, push: (href: string) => void) {
  if (pathname !== rootHref) {
    push(rootHref);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.dispatchEvent(new CustomEvent("hotmess:active-tab-reset", { detail: { href: rootHref } }));
}
