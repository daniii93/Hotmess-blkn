import Link from "next/link";
import { Archive, Globe2, Heart, Star, Users } from "lucide-react";

export default function DisplaySettingsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Inhalt & Anzeige</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Was du siehst und speicherst</h1>
        <p className="mt-3 text-sm leading-6 text-hm-inkSoft">
          Sprache, Sammlungen, enge Freunde und Archiv bleiben an einem Ort.
        </p>
      </section>

      <SettingsPanel icon={Globe2} title="Sprache" detail="Deutsch ist aktiv; SR-HR und Italienisch sind vorbereitet.">
        <div className="grid gap-2">
          <Choice label="Deutsch" active />
          <Choice label="Srpski-Hrvatski" />
          <Choice label="Italiano" />
        </div>
      </SettingsPanel>

      <SettingsPanel icon={Heart} title="Sammlungen" detail="Gespeicherte und gelikte Inhalte.">
        <Link className="rounded-xl bg-hm-ivory px-4 py-3 text-sm font-bold text-hm-ink" href="/feed?saved=1">Gespeicherte Beitraege ansehen</Link>
        <Link className="rounded-xl bg-hm-ivory px-4 py-3 text-sm font-bold text-hm-ink" href="/settings/liked-posts">Mit Gefaellt mir markiert</Link>
      </SettingsPanel>

      <SettingsPanel icon={Users} title="Enge Freunde" detail="Story-Sichtbarkeit fuer deinen inneren Kreis.">
        <p className="rounded-card bg-hm-ivory p-3 text-sm leading-6 text-hm-inkSoft">
          Die enge-Freunde-Liste ist im Social-Modul vorbereitet. Stories mit Zielgruppe close_friends nutzen diese Liste.
        </p>
      </SettingsPanel>

      <SettingsPanel icon={Archive} title="Archiv" detail="Archivierte Beitraege und Stories.">
        <p className="rounded-card bg-hm-ivory p-3 text-sm leading-6 text-hm-inkSoft">
          Archivierte Inhalte bleiben fuer dich sichtbar und verschwinden aus dem oeffentlichen Profil.
        </p>
      </SettingsPanel>
    </main>
  );
}

function SettingsPanel({ icon: Icon, title, detail, children }: { icon: any; title: string; detail: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-card border border-hm-border bg-hm-porcelain p-4 shadow-soft">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-champagne text-hm-ink"><Icon className="h-5 w-5" /></span>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-hm-ink">{title}</h2>
          <p className="mt-1 text-sm text-hm-inkSoft">{detail}</p>
        </div>
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function Choice({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold ${active ? "bg-hm-ink text-white" : "bg-hm-ivory text-hm-ink"}`}>
      <span>{label}</span>
      {active ? <Star className="h-4 w-4 text-hm-gold" /> : null}
    </div>
  );
}
