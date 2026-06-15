import { getTranslations } from "next-intl/server";

type PageShellProps = {
  pageKey: string;
  emptyKey?: string;
  accent?: "gold" | "dating" | "business" | "admin" | "scanner";
};

const accentClasses = {
  gold: "border-hm-gold text-hm-goldDeep",
  dating: "border-hm-dating text-hm-dating",
  business: "border-hm-business text-hm-business",
  admin: "border-hm-admin text-hm-admin",
  scanner: "border-hm-gold text-hm-gold",
};

export async function PageShell({ pageKey, emptyKey, accent = "gold" }: PageShellProps) {
  const t = await getTranslations();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-10">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury sm:p-10">
        <div className={`mb-8 inline-flex rounded-pill border px-4 py-2 text-xs font-semibold uppercase tracking-luxury ${accentClasses[accent]}`}>
          {t(`pages.${pageKey}.eyebrow`)}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h1 className="hm-display max-w-3xl text-4xl text-hm-ink sm:text-6xl">
              {t(`pages.${pageKey}.title`)}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-hm-inkSoft sm:text-lg">
              {t(`pages.${pageKey}.description`)}
            </p>
          </div>
          <div className="rounded-card border border-hm-borderSoft bg-hm-ivory p-5">
            <p className="text-sm leading-7 text-hm-inkSoft">
              {emptyKey ? t(`emptyStates.${emptyKey}`) : t("common.comingSoon")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
