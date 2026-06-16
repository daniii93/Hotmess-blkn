"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function useInboxRealtime() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("inbox-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => window.location.reload())
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members" }, () => window.location.reload())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_notes" }, () => window.location.reload())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);
}
