"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const syncServerSession = async (supabase: ReturnType<typeof createSupabaseBrowserClient>) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return false;

  await fetch("/api/auth/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  });

  return true;
};

export function ProfileEditAuthGateway() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"checking" | "logged_out" | "error">("checking");

  useEffect(() => {
    let active = true;

    const run = async () => {
      const alreadySynced = searchParams.get("session") === "synced";

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (!user) {
          setStatus("logged_out");
          return;
        }

        if (alreadySynced) {
          setStatus("error");
          return;
        }

        const synced = await syncServerSession(supabase);
        if (!active) return;

        if (!synced) {
          setStatus("logged_out");
          return;
        }

        window.location.replace("/profile/edit?session=synced");
      } catch {
        if (active) setStatus("error");
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [searchParams, supabase]);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Profil bearbeiten</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Session pruefen</h1>
        {status === "checking" ? (
          <div className="mt-5 flex items-center gap-3 rounded-card bg-hm-champagne/45 px-4 py-3 text-sm font-semibold text-hm-ink">
            <Loader2 className="h-4 w-4 animate-spin" />
            Deine Anmeldung wird mit dem Server synchronisiert.
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-hm-inkSoft">
            {status === "logged_out"
              ? "Melde dich ein, damit du dein Profil bearbeiten kannst."
              : "Deine Browser-Session wurde erkannt, konnte aber nicht fuer die Bearbeitung aktiviert werden. Bitte melde dich erneut an."}
          </p>
        )}
        {status !== "checking" ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white" href="/login?returnTo=/profile/edit">
              Einloggen
            </Link>
            <Link className="rounded-pill border border-hm-gold/30 px-5 py-3 text-sm font-bold text-hm-ink" href="/profile">
              Zurueck zum Profil
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
