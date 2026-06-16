"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Ban,
  Bell,
  Edit3,
  Eye,
  KeyRound,
  Lock,
  Shield,
  Smartphone,
  UserCog,
} from "lucide-react";
import type { ProfileViewModel } from "@/features/profile/live-service";

type ProfileControlCenterProps = {
  model: ProfileViewModel;
};

const roleLabel: Record<string, string> = {
  admin: "Admin",
  scanner: "Scanner",
  user: "Nutzer",
};

export function ProfileControlCenter({ model }: ProfileControlCenterProps) {
  if (!model.isOwnProfile) return null;

  const { profile } = model;
  const verified = profile.verificationStatus === "verified";
  const privacyState = profile.isPrivate ? "Privates Konto" : "Oeffentliches Konto";
  const followersState = [
    profile.showFollowers ? "Follower sichtbar" : "Follower versteckt",
    profile.showFollowing ? "Gefolgt sichtbar" : "Gefolgt versteckt",
    profile.showEventCount ? "Events sichtbar" : "Events versteckt",
  ].join(" · ");

  return (
    <section className="mt-6 rounded-card border border-hm-border bg-hm-porcelain p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="hm-label">Teil 1</p>
          <h2 className="hm-display mt-1 text-2xl text-hm-ink">Profil, Sicherheit & Privatsphaere</h2>
          <p className="mt-2 text-sm leading-6 text-hm-inkSoft">
            Deine Basisdaten kommen direkt aus Supabase und steuern Login, Sichtbarkeit, Verifizierung und Rollen.
          </p>
        </div>
        <span className="rounded-pill border border-hm-gold/25 bg-hm-champagne px-3 py-1 text-xs font-bold text-hm-ink">
          {roleLabel[profile.role] ?? profile.role}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ControlLink
          href="/profile/edit"
          icon={Edit3}
          title="Profil bearbeiten"
          detail={`${profile.fullName} · @${profile.username}`}
          state={profile.bio ? "Bio aktiv" : "Bio fehlt"}
        />
        <ControlLink
          href="/verify"
          icon={BadgeCheck}
          title="Verifizierung"
          detail={verified ? "Gold-Badge aktiv" : "Stripe Identity starten"}
          state={verified ? "Verifiziert" : "Offen"}
          highlighted={!verified}
        />
        <ControlLink
          href="/settings"
          icon={Lock}
          title="Privatsphaere"
          detail={followersState}
          state={privacyState}
        />
        <ControlLink
          href="/settings"
          icon={Bell}
          title="Benachrichtigungen"
          detail="Push, E-Mail, Nicht-Stoeren und Kategorien"
          state="Settings"
        />
        <ControlLink
          href="/settings"
          icon={KeyRound}
          title="Auth & Sicherheit"
          detail="Passwort, 2FA, aktive Geraete und Sessions"
          state="Konto"
        />
        <ControlLink
          href="/settings"
          icon={Eye}
          title="Sichtbarkeit"
          detail="Profilbesuche, Online-Status, Follower und Event-Anzahl"
          state={profile.isPrivate ? "Strenger" : "Offener"}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {profile.role === "admin" ? (
          <ControlLink href="/admin" icon={Shield} title="Admin-Dashboard" detail="Rollen, Verifizierung, Moderation und Audit" state="Zone F" />
        ) : null}
        {profile.role === "scanner" || profile.role === "admin" ? (
          <ControlLink href="/scanner" icon={Smartphone} title="Scanner-Zugang" detail="Event-Check-in mit QR-Scan" state="Zone E" />
        ) : null}
        <ControlLink
          href="/settings"
          icon={UserCog}
          title="Optionale Welten"
          detail={`Dating ${profile.datingEnabled ? "aktiv" : "aus"} · Business ${profile.businessEnabled ? "aktiv" : "aus"}`}
          state="Module"
        />
        <ControlLink href="/settings" icon={Ban} title="Blockieren & Datenschutz" detail="Blockierte Konten, DSGVO Export, Konto loeschen" state="Kontrolle" />
      </div>
    </section>
  );
}

function ControlLink({
  href,
  icon: Icon,
  title,
  detail,
  state,
  highlighted = false,
}: {
  href: string;
  icon: any;
  title: string;
  detail: string;
  state: string;
  highlighted?: boolean;
}) {
  return (
    <Link
      className={`group rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:shadow-soft ${
        highlighted ? "border-hm-gold/45 bg-hm-gold/10" : "border-hm-border bg-hm-ivory/65"
      }`}
      href={href}
    >
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${highlighted ? "bg-hm-goldDeep text-white" : "bg-hm-champagne text-hm-ink"}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold text-hm-ink">{title}</span>
            <span className="shrink-0 rounded-pill bg-hm-porcelain px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-hm-inkSoft">
              {state}
            </span>
          </span>
          <span className="mt-1 block text-xs leading-5 text-hm-inkSoft">{detail}</span>
        </span>
      </div>
    </Link>
  );
}
