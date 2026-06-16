"use client";

import { useEffect, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const syncSession = async (accessToken?: string, refreshToken?: string) => {
  if (!accessToken || !refreshToken) return;

  await fetch("/api/auth/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
    }),
  }).catch(() => null);
};

export function AuthSessionBridge() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let active = true;

    const syncCurrentSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active || !session) return;
      await syncSession(session.access_token, session.refresh_token);
    };

    void syncCurrentSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session?.access_token, session?.refresh_token);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return null;
}
