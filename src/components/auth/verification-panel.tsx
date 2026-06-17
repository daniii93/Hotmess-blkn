"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type VerificationProfile = {
  verification_status: "pending" | "verified" | "rejected" | "suspended" | "unverified";
  stripe_identity_session_id: string | null;
};

export function VerificationPanel() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [profile, setProfile] = useState<VerificationProfile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;
      if (!user) {
        setStatus("error");
        setMessage("Bitte melde dich an, um die Verifizierung zu starten.");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("verification_status,stripe_identity_session_id")
        .eq("id", user.id)
        .maybeSingle<VerificationProfile>();

      if (!active) return;
      if (error || !data) {
        setStatus("error");
        setMessage("Dein Verifizierungsstatus konnte nicht gelesen werden.");
        return;
      }

      setProfile(data);
      setStatus("ready");
    };

    void load();

    return () => {
      active = false;
    };
  }, [supabase]);

  const startVerification = async () => {
    setStarting(true);
    setMessage(null);

    const response = await fetch("/api/auth/verify/start", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as { url?: string; status?: string; error?: string } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "Verifizierung konnte nicht gestartet werden.");
      setStarting(false);
      return;
    }

    if (payload?.url) {
      window.location.assign(payload.url);
      return;
    }

    setProfile((current) => current ? { ...current, verification_status: "pending" } : { verification_status: "pending", stripe_identity_session_id: null });
    setMessage(payload?.status === "pending" ? "Verifizierung wurde als ausstehend markiert." : "Verifizierung gestartet.");
    setStarting(false);
  };

  const verificationStatus = profile?.verification_status === "unverified" ? "pending" : (profile?.verification_status ?? "pending");
  const verified = verificationStatus === "verified";

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-28">
      <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <div className="flex items-start gap-4">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${verified ? "bg-emerald-100 text-emerald-700" : "bg-hm-champagne text-hm-ink"}`}>
            {verified ? <BadgeCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="hm-label">Supabase Status</p>
            <h2 className="hm-display mt-1 text-3xl text-hm-ink">
              {status === "loading"
                ? "Status wird geladen"
                : verified
                  ? "Du bist verifiziert"
                  : verificationStatus === "pending"
                    ? "Verifizierung erforderlich"
                    : verificationStatus === "suspended"
                      ? "Verifizierung gesperrt"
                      : "Verifizierung nicht freigegeben"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
              Bitte bestaetige deine Identitaet, um HotMess nutzen zu koennen. Ohne Verifizierung bleiben Feed, Chats, Events, Dating, Business und andere Nutzer gesperrt.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-hm-border bg-hm-ivory/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-hm-inkSoft">Aktueller Status</p>
          <p className="mt-2 text-sm font-bold text-hm-ink">{verificationStatus}</p>
          {profile?.stripe_identity_session_id ? <p className="mt-1 text-xs text-hm-inkSoft">Stripe Session: {profile.stripe_identity_session_id}</p> : null}
        </div>

        {message ? (
          <p className={`mt-4 rounded-card px-4 py-3 text-sm font-semibold ${status === "error" ? "bg-red-50 text-red-700" : "bg-hm-champagne text-hm-ink"}`}>
            {message}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          {!verified ? (
            <button
              className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-hm-porcelain transition hover:bg-hm-gold disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={starting || status === "loading"}
              onClick={startVerification}
            >
              {starting ? "Wird gestartet..." : verificationStatus === "pending" ? "Erneut starten" : "Stripe Identity starten"}
            </button>
          ) : null}
          <Link className="rounded-pill border border-hm-gold/30 bg-hm-porcelain px-5 py-3 text-sm font-bold text-hm-ink hover:bg-hm-champagne" href="/profile">
            Zurueck zum Profil
          </Link>
        </div>
      </div>
    </section>
  );
}
