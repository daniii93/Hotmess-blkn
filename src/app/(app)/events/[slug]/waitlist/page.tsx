import { PageShell } from "@/components/shell/page-shell";

export default function EventWaitlistPage() {
  return (
    <>
      <PageShell pageKey="waitlist" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <div className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
          <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Warteliste</p>
          <h2 className="hm-display mt-3 text-3xl text-hm-ink">Deine Position: 3</h2>
          <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
            Sobald ein Platz frei wird, bekommst du 20 Minuten Zeit zum Kauf. Danach rückt die nächste Person nach.
          </p>
          <button className="mt-6 rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink" type="button">
            Von Warteliste entfernen
          </button>
        </div>
      </section>
    </>
  );
}
