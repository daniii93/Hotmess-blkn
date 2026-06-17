"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  Eye,
  FileText,
  Globe2,
  Heart,
  HelpCircle,
  Lock,
  QrCode,
  Search,
  Shield,
  Ticket,
  UserCog,
  Users,
} from "lucide-react";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BrowserProfile = {
  id: string;
  email: string | null;
  username: string;
  first_name: string;
  last_name: string;
  is_private: boolean;
  verification_status: string;
  dating_enabled: boolean;
  business_enabled: boolean;
  role: string;
};

const syncServerSession = async (supabase: ReturnType<typeof createSupabaseBrowserClient>) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return;

  await fetch("/api/auth/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  }).catch(() => null);
};

export function SettingsAuthGateway() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<"checking" | "logged_out" | "loaded" | "error">("checking");
  const [profile, setProfile] = useState<BrowserProfile | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      await syncServerSession(supabase);
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
        .select("id,email,username,first_name,last_name,is_private,verification_status,dating_enabled,business_enabled,role")
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

    void load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (status === "loaded" && profile) return <SettingsMenu profile={profile} />;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Einstellungen</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Konto pruefen</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">
          {status === "checking"
            ? "Ich pruefe gerade deine Browser-Session."
            : status === "error"
              ? "Deine Session wurde erkannt, aber dein Profil konnte nicht gelesen werden."
              : "Melde dich ein, damit deine Einstellungen geladen werden."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white" href="/login?returnTo=/settings">
            Einloggen
          </Link>
          <Link className="rounded-pill border border-hm-gold/30 px-5 py-3 text-sm font-bold text-hm-ink" href="/profile">
            Zurueck zum Profil
          </Link>
        </div>
      </section>
    </main>
  );
}

function SettingsMenu({ profile }: { profile: BrowserProfile }) {
  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.username;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Einstellungen & Aktivitaet</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Kontrolle ueber dein HotMess</h1>
        <p className="mt-3 text-sm text-hm-inkSoft">
          @{profile.username} - {profile.verification_status === "verified" ? "verifiziert" : "nicht verifiziert"}
        </p>
      </section>

      <SettingsGroup title="Konto">
        <SettingsLink icon={UserCog} title="Persoenliche Daten" detail={`${fullName} - ${profile.email ?? "E-Mail"}`} href="/profile/edit" />
        <SettingsLink icon={Shield} title="Verifizierung" detail={profile.verification_status === "verified" ? "Gold-Badge aktiv" : "Stripe Identity starten"} href="/verify" />
        <SettingsLink icon={Lock} title="Passwort & 2FA" detail="Passwort aendern, Backup-Codes, aktive Geraete" href="/settings/security" />
        <SettingsLink icon={Download} title="Meine Daten herunterladen" detail="DSGVO Export vorbereiten" href="/settings/privacy" />
      </SettingsGroup>

      <SettingsGroup title="Privatsphaere">
        <SettingsLink icon={Eye} title="Privates Konto" detail={profile.is_private ? "Aktiv" : "Oeffentlich"} href="/settings/privacy" />
        <SettingsLink icon={UserCog} title="Follower & Gefolgt" detail="Sichtbarkeit, Follower entfernen, blockierte Konten" href="/settings/privacy" />
        <SettingsLink icon={Bell} title="Wer kann mich anschreiben" detail="Nachrichten, Anfragen und Gruppen-Einladungen" href="/settings/messages" />
        <SettingsLink icon={Eye} title="Aktivitaetsstatus & Profilbesuche" detail="Online-Status und Besuchsliste steuern" href="/settings/privacy" />
      </SettingsGroup>

      <SettingsGroup title="Benachrichtigungen">
        <SettingsLink icon={Bell} title="Push & E-Mail" detail="Nachrichten, Likes, Kommentare, Events und Warteliste" href="/settings/notifications" />
        <SettingsLink icon={Bell} title="Nicht-Stoeren" detail="Zeitfenster fuer ruhige Stunden" href="/settings/notifications" />
      </SettingsGroup>

      <SettingsGroup title="Module">
        <SettingsLink icon={Heart} title="HotMess Dating" detail={profile.dating_enabled ? "Aktiv" : "Aktivieren nach Verifizierung"} href="/dating/profile" accent="dating" />
        <SettingsLink icon={BriefcaseBusiness} title="HotMess Business" detail={profile.business_enabled ? "Aktiv" : "Business-Profil anlegen"} href="/business/profile" accent="business" />
      </SettingsGroup>

      <SettingsGroup title="Inhalt & Anzeige">
        <SettingsLink icon={Globe2} title="Sprache" detail="Deutsch - Srpski-Hrvatski - Italiano" href="/settings/display" />
        <SettingsLink icon={FileText} title="Gespeicherte Beitraege" detail="Private Sammlung" href="/feed?saved=1" />
        <SettingsLink icon={Heart} title="Mit Gefaellt mir markiert" detail="Deine gelikten Beitraege" href="/settings/liked-posts" />
        <SettingsLink icon={Search} title="Suchverlauf" detail="Einzelne Suchen entfernen oder alles loeschen" href="/settings/search-history" />
        <SettingsLink icon={QrCode} title="QR-Code" detail="Profil teilen, Farbe waehlen, herunterladen" href="/settings/qr" />
        <SettingsLink icon={UserCog} title="Enge Freunde" detail="Story-Sichtbarkeit verwalten" href="/settings/display" />
        <SettingsLink icon={FileText} title="Archiv" detail="Archivierte Beitraege und Stories" href="/settings/display" />
      </SettingsGroup>

      <SettingsGroup title="Tickets & Events">
        <SettingsLink icon={Ticket} title="Meine Tickets" detail="QR-Tickets, Hotel-Codes, Add-ons" href="/tickets" />
        <SettingsLink icon={CalendarDays} title="Meine Events & Warteliste" detail="Besuchte Events und offene Plaetze" href="/events" />
      </SettingsGroup>

      <SettingsGroup title="Hilfe & Info">
        <SettingsLink icon={Users} title="Freunde finden & einladen" detail="Personen entdecken und Netzwerk aufbauen" href="/explore/people" />
        <SettingsLink icon={HelpCircle} title="Hilfe & Support" detail="Kontakt, Recovery und offene Fragen" href="/settings/support" />
        <SettingsLink icon={FileText} title="AGB" detail="Nutzungsbedingungen" href="/agb" />
        <SettingsLink icon={FileText} title="Datenschutz" detail="DSGVO und Privatsphaere" href="/datenschutz" />
        <SettingsLink icon={FileText} title="Impressum" detail="Braun Gruppe GmbH" href="/impressum" />
        {profile.role === "admin" ? <SettingsLink icon={Shield} title="Admin-Dashboard" detail="Zone F" href="/admin" /> : null}
        {profile.role === "scanner" ? <SettingsLink icon={Shield} title="Scanner" detail="Zone E" href="/scanner" /> : null}
      </SettingsGroup>

      <SettingsGroup title="Sitzung">
        <LogoutButton />
      </SettingsGroup>
    </main>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-card border border-hm-border bg-hm-porcelain p-3 shadow-soft">
      <h2 className="px-2 py-2 text-xs font-bold uppercase tracking-[0.18em] text-hm-inkSoft">{title}</h2>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function SettingsLink({
  icon: Icon,
  title,
  detail,
  href,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  href: string;
  accent?: "dating" | "business";
}) {
  return (
    <Link className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-hm-champagne/45" href={href}>
      <span
        className={`grid h-10 w-10 place-items-center rounded-full ${
          accent === "dating"
            ? "bg-hm-dating/10 text-hm-dating"
            : accent === "business"
              ? "bg-hm-business/10 text-hm-business"
              : "bg-hm-champagne text-hm-ink"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-hm-ink">{title}</span>
        <span className="block truncate text-xs text-hm-inkSoft">{detail}</span>
      </span>
    </Link>
  );
}
