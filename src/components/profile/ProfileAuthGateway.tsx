"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, BriefcaseBusiness, Heart, KeyRound, Lock, Shield, UserPlus, Users } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BrowserProfile = {
  id: string;
  email: string | null;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  is_private: boolean;
  show_followers: boolean;
  show_following: boolean;
  show_event_count: boolean;
  verification_status: string;
  dating_enabled: boolean;
  business_enabled: boolean;
  role: string;
};

const features = [
  {
    icon: KeyRound,
    title: "Login & Registrierung",
    detail: "Melde dich an oder erstelle dein Konto, damit dein Profil, Tickets und Einstellungen gespeichert werden.",
  },
  {
    icon: Users,
    title: "Profil & Identitaet",
    detail: "Name, Username, Avatar, Bio, Stadt, Musik und Sichtbarkeit laufen zentral ueber dein Profil.",
  },
  {
    icon: Lock,
    title: "Privacy",
    detail: "Privates Konto, Follower-Sichtbarkeit, Blockierungen, Online-Status und DSGVO-Kontrollen.",
  },
  {
    icon: BadgeCheck,
    title: "Verifizierung",
    detail: "Stripe Identity schaltet den goldenen Trust-Badge frei und oeffnet sensible Funktionen.",
  },
  {
    icon: Shield,
    title: "Rollen",
    detail: "User, Scanner und Admin werden serverseitig aus Supabase gelesen und geschuetzt.",
  },
  {
    icon: UserPlus,
    title: "Optionale Welten",
    detail: "Dating und Business bleiben getrennt und werden erst nach deiner Aktivierung sichtbar.",
  },
] as const;

export function ProfileAuthGateway() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<"checking" | "logged_out" | "loaded" | "error">("checking");
  const [profile, setProfile] = useState<BrowserProfile | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setStatus("logged_out");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,username,first_name,last_name,avatar_url,bio,city,country,is_private,show_followers,show_following,show_event_count,verification_status,dating_enabled,business_enabled,role")
        .eq("id", user.id)
        .maybeSingle<BrowserProfile>();

      if (!active) return;

      if (error || !data) {
        setStatus("error");
        return;
      }

      setProfile(data);
      setStatus("loaded");
    };

    void loadProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (status === "loaded" && profile) {
    return <LoggedInProfileGateway profile={profile} />;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-28 pt-6">
      <section className="overflow-hidden rounded-card border border-hm-border bg-hm-porcelain shadow-luxury">
        <div className="border-b border-hm-gold/15 bg-hm-champagne/35 p-6 sm:p-8">
          <p className="hm-label">Teil 1</p>
          <h1 className="hm-display mt-2 text-4xl text-hm-ink sm:text-5xl">Basis, Auth & Profil</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-hm-inkSoft">
            Dieser Profil-Button ist die Zentrale fuer Anmeldung, Profil, Privacy, Verifizierung und Rollen.
            {status === "checking"
              ? " Ich pruefe gerade, ob deine Supabase-Session im Browser aktiv ist."
              : " Logge dich ein, um deine echten Supabase-Daten zu sehen und zu bearbeiten."}
          </p>
          {status === "error" ? (
            <p className="mt-4 rounded-card bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              Deine Session wurde erkannt, aber dein Profil konnte nicht gelesen werden. Bitte lade die Seite neu oder melde dich erneut an.
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-hm-porcelain hover:bg-hm-gold" href="/login?returnTo=/profile">
              Einloggen
            </Link>
            <Link className="rounded-pill border border-hm-gold/30 bg-hm-porcelain px-5 py-3 text-sm font-bold text-hm-ink hover:bg-hm-champagne" href="/register">
              Konto erstellen
            </Link>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
          {features.map(({ icon: Icon, title, detail }) => (
            <article key={title} className="rounded-2xl border border-hm-border bg-hm-ivory/70 p-4">
              <div className="flex gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-hm-champagne text-hm-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-hm-ink">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-hm-inkSoft">{detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function LoggedInProfileGateway({ profile }: { profile: BrowserProfile }) {
  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.username;
  const verified = profile.verification_status === "verified";
  const privacy = profile.is_private ? "Privates Konto" : "Oeffentliches Konto";
  const role = profile.role === "admin" ? "Admin" : profile.role === "scanner" ? "Scanner" : "Nutzer";

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-28 pt-6">
      <section className="overflow-hidden rounded-card border border-hm-border bg-hm-porcelain shadow-luxury">
        <div className="border-b border-hm-gold/15 bg-hm-champagne/35 p-6 sm:p-8">
          <p className="hm-label">Teil 1 · Supabase Live</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="hm-display text-4xl text-hm-ink sm:text-5xl">{fullName}</h1>
              <p className="mt-2 text-sm font-semibold text-hm-inkSoft">@{profile.username} · {profile.email ?? "Keine E-Mail im Profil"}</p>
            </div>
            <Avatar profile={profile} name={fullName} />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-hm-inkSoft">
            Du bist eingeloggt. Diese Werte kommen direkt aus deiner Supabase-Session und der Tabelle <span className="font-semibold text-hm-ink">profiles</span>.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-hm-porcelain hover:bg-hm-gold" href="/profile/edit">
              Profil bearbeiten
            </Link>
            <Link className="rounded-pill border border-hm-gold/30 bg-hm-porcelain px-5 py-3 text-sm font-bold text-hm-ink hover:bg-hm-champagne" href="/settings">
              Einstellungen
            </Link>
            {!verified ? (
              <Link className="rounded-pill border border-hm-gold/30 bg-hm-porcelain px-5 py-3 text-sm font-bold text-hm-ink hover:bg-hm-champagne" href="/verify">
                Verifizieren
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
          <StatusCard icon={BadgeCheck} title="Verifizierung" value={verified ? "Verifiziert" : "Nicht verifiziert"} detail={verified ? "Gold-Badge aktiv" : "Stripe Identity noch offen"} />
          <StatusCard icon={Lock} title="Privatsphaere" value={privacy} detail={`${profile.show_followers ? "Follower sichtbar" : "Follower versteckt"} · ${profile.show_following ? "Gefolgt sichtbar" : "Gefolgt versteckt"}`} />
          <StatusCard icon={Shield} title="Rolle" value={role} detail={profile.role === "admin" ? "Admin-Dashboard freigeschaltet" : profile.role === "scanner" ? "Scanner-Zugang moeglich" : "Standard Kundenkonto"} />
          <StatusCard icon={Users} title="Profil" value={profile.city ? `${profile.city}${profile.country ? `, ${profile.country}` : ""}` : "Stadt offen"} detail={profile.bio || "Bio noch nicht ausgefuellt"} />
          <StatusCard icon={Heart} title="Dating" value={profile.dating_enabled ? "Aktiv" : "Aus"} detail="Getrennter optionaler Modus" />
          <StatusCard icon={BriefcaseBusiness} title="Business" value={profile.business_enabled ? "Aktiv" : "Aus"} detail="Business & Jobs optional" />
        </div>
      </section>
    </main>
  );
}

function Avatar({ profile, name }: { profile: BrowserProfile; name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "HM";

  return (
    <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-hm-ivory bg-hm-champagne text-lg font-bold text-hm-ink shadow-soft">
      {profile.avatar_url ? <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" /> : initials}
    </div>
  );
}

function StatusCard({ icon: Icon, title, value, detail }: { icon: any; title: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-hm-border bg-hm-ivory/70 p-4">
      <div className="flex gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-hm-champagne text-hm-ink">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-hm-inkSoft">{title}</p>
          <h2 className="mt-1 truncate text-sm font-bold text-hm-ink">{value}</h2>
          <p className="mt-1 text-xs leading-5 text-hm-inkSoft">{detail}</p>
        </div>
      </div>
    </article>
  );
}
