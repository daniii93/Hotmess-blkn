import Link from "next/link";
import { BadgeCheck, KeyRound, Lock, Shield, UserPlus, Users } from "lucide-react";

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
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 pb-28 pt-6">
      <section className="overflow-hidden rounded-card border border-hm-border bg-hm-porcelain shadow-luxury">
        <div className="border-b border-hm-gold/15 bg-hm-champagne/35 p-6 sm:p-8">
          <p className="hm-label">Teil 1</p>
          <h1 className="hm-display mt-2 text-4xl text-hm-ink sm:text-5xl">Basis, Auth & Profil</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-hm-inkSoft">
            Dieser Profil-Button ist die Zentrale fuer Anmeldung, Profil, Privacy, Verifizierung und Rollen.
            Logge dich ein, um deine echten Supabase-Daten zu sehen und zu bearbeiten.
          </p>
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
