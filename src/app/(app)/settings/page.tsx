import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, BriefcaseBusiness, CalendarDays, Download, Eye, FileText, Globe2, Heart, HelpCircle, Lock, Shield, Ticket, UserCog } from "lucide-react";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { getProfileView } from "@/features/profile/live-service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const model = await getProfileView();

  if (!model) redirect("/login?returnTo=/settings");

  const { profile } = model;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Einstellungen & Aktivitaet</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Kontrolle ueber dein HotMess</h1>
        <p className="mt-3 text-sm text-hm-inkSoft">@{profile.username} · {profile.verificationStatus === "verified" ? "verifiziert" : "nicht verifiziert"}</p>
      </section>

      <SettingsGroup title="Konto">
        <SettingsLink icon={UserCog} title="Persoenliche Daten" detail={`${profile.fullName} · ${profile.email ?? "E-Mail"}`} href="/profile/edit" />
        <SettingsLink icon={Shield} title="Verifizierung" detail={profile.verificationStatus === "verified" ? "Gold-Badge aktiv" : "Stripe Identity starten"} href="/verify" />
        <SettingsItem icon={Lock} title="Passwort & 2FA" detail="Passwort aendern, Zwei-Faktor, aktive Geraete" />
        <SettingsItem icon={Download} title="Meine Daten herunterladen" detail="DSGVO Export vorbereiten" />
      </SettingsGroup>

      <SettingsGroup title="Privatsphaere">
        <SettingsLink icon={Eye} title="Privates Konto" detail={profile.isPrivate ? "Aktiv" : "Oeffentlich"} href="/profile/edit" />
        <SettingsItem icon={UserCog} title="Follower & Gefolgt" detail="Sichtbarkeit, Follower entfernen, Blockierte Konten" />
        <SettingsItem icon={Bell} title="Wer kann mich anschreiben" detail="Alle oder nur Freunde" />
        <SettingsItem icon={Eye} title="Aktivitaetsstatus & Profilbesuche" detail="Online-Status und Besuchsliste steuern" />
      </SettingsGroup>

      <SettingsGroup title="Benachrichtigungen">
        <SettingsItem icon={Bell} title="Push & E-Mail" detail="Nachrichten, Likes, Kommentare, Events und Warteliste" />
        <SettingsItem icon={Bell} title="Nicht-Stoeren" detail="Zeitfenster fuer ruhige Stunden" />
      </SettingsGroup>

      <SettingsGroup title="Module">
        <SettingsLink icon={Heart} title="HotMess Dating" detail={profile.datingEnabled ? "Aktiv" : "Aktivieren nach Verifizierung"} href="/dating/profile" accent="dating" />
        <SettingsLink icon={BriefcaseBusiness} title="HotMess Business" detail={profile.businessEnabled ? "Aktiv" : "Business-Profil anlegen"} href="/business/profile" accent="business" />
      </SettingsGroup>

      <SettingsGroup title="Inhalt & Anzeige">
        <SettingsItem icon={Globe2} title="Sprache" detail="Deutsch · Srpski-Hrvatski · Italiano" />
        <SettingsLink icon={FileText} title="Gespeicherte Beitraege" detail="Private Sammlung" href="/feed?saved=1" />
        <SettingsItem icon={UserCog} title="Enge Freunde" detail="Story-Sichtbarkeit verwalten" />
        <SettingsItem icon={FileText} title="Archiv" detail="Archivierte Beitraege und Stories" />
      </SettingsGroup>

      <SettingsGroup title="Tickets & Events">
        <SettingsLink icon={Ticket} title="Meine Tickets" detail="QR-Tickets, Hotel-Codes, Add-ons" href="/tickets" />
        <SettingsLink icon={CalendarDays} title="Meine Events & Warteliste" detail="Besuchte Events und offene Plaetze" href="/events" />
      </SettingsGroup>

      <SettingsGroup title="Hilfe & Info">
        <SettingsItem icon={HelpCircle} title="Hilfe & Support" detail="Kontakt und offene Fragen" />
        <SettingsLink icon={FileText} title="AGB" detail="Nutzungsbedingungen" href="/agb" />
        <SettingsLink icon={FileText} title="Datenschutz" detail="DSGVO und Privatsphaere" href="/datenschutz" />
        <SettingsLink icon={FileText} title="Impressum" detail="Braun Gruppe GmbH" href="/impressum" />
        {profile.role === "admin" ? <SettingsLink icon={Shield} title="Admin-Dashboard" detail="Zone F" href="/admin" /> : null}
        {profile.role === "scanner" ? <SettingsLink icon={Shield} title="Scanner" detail="Zone E" href="/scanner" /> : null}
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

function SettingsLink({ icon: Icon, title, detail, href, accent }: { icon: any; title: string; detail: string; href: string; accent?: "dating" | "business" }) {
  return (
    <Link className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-hm-champagne/45" href={href}>
      <span className={`grid h-10 w-10 place-items-center rounded-full ${accent === "dating" ? "bg-hm-dating/10 text-hm-dating" : accent === "business" ? "bg-hm-business/10 text-hm-business" : "bg-hm-champagne text-hm-ink"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-hm-ink">{title}</span>
        <span className="block truncate text-xs text-hm-inkSoft">{detail}</span>
      </span>
    </Link>
  );
}

function SettingsItem({ icon: Icon, title, detail }: { icon: any; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-champagne text-hm-ink">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-hm-ink">{title}</span>
        <span className="block truncate text-xs text-hm-inkSoft">{detail}</span>
      </span>
    </div>
  );
}
