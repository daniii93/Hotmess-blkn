"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type NavBadgeState = {
  unreadMessages: number;
  hasUnreadNotifications: boolean;
  hasNewWatch: boolean;
  avatarUrl: string | null;
  initials: string;
};

const fallback: NavBadgeState = {
  unreadMessages: 0,
  hasUnreadNotifications: false,
  hasNewWatch: false,
  avatarUrl: null,
  initials: "HM",
};

export function useNavBadges() {
  const [state, setState] = useState<NavBadgeState>(fallback);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;

      const [{ data: profile }, { data: conversations }, { count: notifications }] = await Promise.all([
        supabase.from("profiles").select("first_name,last_name,username,avatar_url").eq("id", userId).maybeSingle(),
        supabase.from("conversation_members").select("unread_count").eq("user_id", userId),
        supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_read", false),
      ]);

      const unreadMessages = (conversations ?? []).reduce((sum, row) => sum + Number(row.unread_count ?? 0), 0);
      const first = profile?.first_name?.[0] ?? profile?.username?.[0] ?? "H";
      const last = profile?.last_name?.[0] ?? "M";
      if (!mounted) return;
      setState({
        unreadMessages,
        hasUnreadNotifications: Number(notifications ?? 0) > 0,
        hasNewWatch: false,
        avatarUrl: profile?.avatar_url ?? null,
        initials: `${first}${last}`.toUpperCase(),
      });
    };

    load();

    const channel = supabase
      .channel("bottom-nav-badges")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, load)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return state;
}

