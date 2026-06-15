import { PrivacyToggle } from "@/components/settings/privacy-toggle";
import { SessionList } from "@/components/settings/session-list";

export default function SettingsPage() {
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
          <PrivacyToggle label="Dating aktivieren" enabled={false} />
          <PrivacyToggle label="Business aktivieren" enabled={false} />
        </div>
      </section>
      <section className="mt-6">
        <SessionList />
      </section>
    </main>
  );
}
