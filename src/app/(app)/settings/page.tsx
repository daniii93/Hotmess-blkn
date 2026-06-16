import Link from "next/link";
import { PrivacyToggle } from "@/components/settings/privacy-toggle";
import { SessionList } from "@/components/settings/session-list";
import { getCurrentUserProfile } from "@/features/events/live-service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getCurrentUserProfile();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
        <p className="hm-label">Einstellungen</p>
        <h1 className="hm-display mt-3 text-4xl">Account, Sicherheit und Privatsphaere</h1>
        <div className="mt-8 grid gap-3">
          <PrivacyToggle label="Follower-Anzahl zeigen" />
          <PrivacyToggle label="Following-Anzahl zeigen" />
          <PrivacyToggle label="Event-Anzahl zeigen" />
          <PrivacyToggle label="Online-Status zeigen" />
          <PrivacyToggle label="Zuletzt aktiv zeigen" />
          <PrivacyToggle label="Profilbesuche-Liste zeigen" />
          <div className="flex items-center justify-between gap-4 rounded-card border border-hm-border bg-hm-porcelain p-4 text-sm text-hm-ink">
            <span>Dating {profile?.dating_enabled ? "aktiv" : "aktivieren"}</span>
            <Link className="rounded-pill bg-hm-dating px-4 py-2 text-xs font-semibold text-white" href="/dating/profile">
              {profile?.dating_enabled ? "Bearbeiten" : "Aktivieren"}
            </Link>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-card border border-hm-border bg-hm-porcelain p-4 text-sm text-hm-ink">
            <span>Business {profile?.business_enabled ? "aktiv" : "aktivieren"}</span>
            <Link className="rounded-pill bg-hm-business px-4 py-2 text-xs font-semibold text-white" href="/business/profile">
              {profile?.business_enabled ? "Bearbeiten" : "Aktivieren"}
            </Link>
          </div>
        </div>
      </section>
      <section className="mt-6">
        <SessionList />
      </section>
    </main>
  );
}
