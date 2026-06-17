import Link from "next/link";
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
import { BusinessModuleLinks, type BusinessModuleState } from "@/components/settings/BusinessModuleLinks";
import { SettingsAuthGateway } from "@/components/settings/SettingsAuthGateway";
import { getProfileView } from "@/features/profile/live-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const model = await getProfileView();

  if (!model) return <SettingsAuthGateway />;

  const { profile } = model;
  const businessModules = await getBusinessModules(profile.id, profile.businessEnabled);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Einstellungen & Aktivitaet</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Kontrolle ueber dein HotMess</h1>
        <p className="mt-3 text-sm text-hm-inkSoft">
          @{profile.username} · {profile.verificationStatus === "verified" ? "verifiziert" : "nicht verifiziert"}
        </p>
      </section>

      <SettingsGroup title="Konto">
        <SettingsLink icon={UserCog} title="Persoenliche Daten" detail={`${profile.fullName} · ${profile.email ?? "E-Mail"}`} href="/profile/edit" />
        <SettingsLink icon={Shield} title="Verifizierung" detail={profile.verificationStatus === "verified" ? "Gold-Badge aktiv" : "Stripe Identity starten"} href="/verify" />
        <SettingsLink icon={Lock} title="Passwort & 2FA" detail="Passwort aendern, Backup-Codes, aktive Geraete" href="/settings/security" />
        <SettingsLink icon={Download} title="Meine Daten herunterladen" detail="DSGVO Export vorbereiten" href="/settings/privacy" />
      </SettingsGroup>

      <SettingsGroup title="Privatsphaere">
        <SettingsLink icon={Eye} title="Privates Konto" detail={profile.isPrivate ? "Aktiv" : "Oeffentlich"} href="/settings/privacy" />
        <SettingsLink icon={UserCog} title="Follower & Gefolgt" detail="Sichtbarkeit, Follower entfernen, blockierte Konten" href="/settings/privacy" />
        <SettingsLink icon={Bell} title="Wer kann mich anschreiben" detail="Nachrichten, Anfragen und Gruppen-Einladungen" href="/settings/messages" />
        <SettingsLink icon={Eye} title="Aktivitaetsstatus & Profilbesuche" detail="Online-Status und Besuchsliste steuern" href="/settings/privacy" />
      </SettingsGroup>

      <SettingsGroup title="Benachrichtigungen">
        <SettingsLink icon={Bell} title="Push & E-Mail" detail="Nachrichten, Likes, Kommentare, Events und Warteliste" href="/settings/notifications" />
        <SettingsLink icon={Bell} title="Nicht-Stoeren" detail="Zeitfenster fuer ruhige Stunden" href="/settings/notifications" />
      </SettingsGroup>

      <SettingsGroup title="Module">
        <SettingsLink icon={Heart} title="HotMess Dating" detail={profile.datingEnabled ? "Aktiv" : "Aktivieren nach Verifizierung"} href="/dating/profile" accent="dating" />
        <SettingsLink icon={BriefcaseBusiness} title="HotMess Business" detail={profile.businessEnabled ? "Aktiv" : "Business-Profil anlegen"} href="/business/profile" accent="business" />
        <BusinessModuleLinks modules={businessModules} businessEnabled={profile.businessEnabled} />
      </SettingsGroup>

      <SettingsGroup title="Inhalt & Anzeige">
        <SettingsLink icon={Globe2} title="Sprache" detail="Deutsch · Srpski-Hrvatski · Italiano" href="/settings/display" />
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
        <AccountUsernameHelp />
        <HackedAccountHelp />
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

async function getBusinessModules(userId: string, businessEnabled: boolean): Promise<BusinessModuleState[]> {
  if (!businessEnabled) return [];

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("business_profiles")
    .select("id,business_profile_modules(module_key,is_active)")
    .or(`user_id.eq.${userId},owner_user_id.eq.${userId}`)
    .maybeSingle<{ id: string; business_profile_modules?: BusinessModuleState[] | null }>();

  return data?.business_profile_modules?.filter((module) => module.is_active) ?? [];
}

function HackedAccountHelp() {
  return (
    <details className="rounded-xl border border-[#9C4A3C]/20 bg-red-50/50 px-3 py-3">
      <summary className="flex cursor-pointer items-center gap-3 text-sm font-bold text-hm-ink">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#9C4A3C]">
          <Shield className="h-5 w-5" />
        </span>
        Konto gehackt oder verdaechtig?
      </summary>
      <ul className="mt-4 list-disc space-y-1 pl-16 text-sm leading-6 text-hm-inkSoft">
        <li>Passwort sofort aendern.</li>
        <li>Aktive Sitzungen in Passwort & Sicherheit pruefen und alte Geraete entfernen.</li>
        <li>2FA und Backup-Codes aktivieren.</li>
        <li>Support kontaktieren. HotMess kann deine Stripe-Identity-Verifizierung zur Wiederherstellung nutzen.</li>
      </ul>
    </details>
  );
}

function AccountUsernameHelp() {
  const sections = [
    {
      title: "Konto erstellen",
      items: [
        "Mindestalter: 18 Jahre.",
        "Registrierung per E-Mail mit Bestaetigung; Telefon/SMS ist als naechster Provider-Schritt vorbereitet.",
        "Danach legst du Passwort, Geburtsdatum, Name und Benutzername fest.",
        "Pro verifizierter Person ist ein Konto vorgesehen.",
      ],
    },
    {
      title: "Benutzername",
      items: [
        "Vergabe nach Verfuegbarkeit: wer zuerst kommt.",
        "Keine Reservierung fuer Marken oder Unternehmen.",
        "Ist ein Name vergeben, schlagen wir Varianten mit Punkt, Zahl, Unterstrich oder Abkuerzung vor.",
        "Aenderbar ueber Profil bearbeiten, maximal alle 30 Tage.",
      ],
    },
    {
      title: "Marken & inaktive Konten",
      items: [
        "Ein Markenname allein begruendet keinen Anspruch auf einen Benutzernamen.",
        "Bei Markenrechtsverletzung oder Identitaetstaeuschung kann der Benutzername gemeldet werden.",
        "Fuer Namen auf scheinbar inaktiven Konten gibt es keine automatische Freigabe.",
      ],
    },
    {
      title: "Privatsphaere & Sicherheit",
      items: [
        "Alle Konten sind standardmaessig privat.",
        "Im Business-Modus ist nur dein Business-Profil fuer andere Business-Mitglieder sichtbar.",
        "Aktiviere Zwei-Faktor-Authentifizierung, sobald sie in deinem Konto angeboten wird.",
      ],
    },
  ];

  return (
    <details className="rounded-xl border border-hm-gold/20 bg-hm-ivory px-3 py-3">
      <summary className="flex cursor-pointer items-center gap-3 text-sm font-bold text-hm-ink">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-champagne text-hm-ink">
          <HelpCircle className="h-5 w-5" />
        </span>
        Konto & Benutzername
      </summary>
      <div className="mt-4 grid gap-4 pl-1 text-sm text-hm-inkSoft">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-bold text-hm-ink">{section.title}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </details>
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
