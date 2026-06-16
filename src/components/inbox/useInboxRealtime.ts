"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function useInboxRealtime(onRefresh: () => void) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("inbox-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, onRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members" }, onRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_notes" }, onRefresh)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onRefresh]);
}
