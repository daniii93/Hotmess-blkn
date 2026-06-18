import { AdminProviderActionButtons } from "@/components/local-services/LocalServicesForms";
import { formatLocalServiceMoney, getLocalServicesAdminDashboard } from "@/features/local-services/service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminLocalServicesPage() {
  const supabase = createSupabaseAdminClient();
  const [dashboard, providerRows, categories, disputes] = await Promise.all([
    getLocalServicesAdminDashboard(),
    supabase
      .from("local_service_provider_profiles")
      .select("id,verification_status,base_city,service_radius_km,rating_avg,rating_count,trust_score,business_profiles(display_name,legal_name,company,verification_status)")
      .order("created_at", { ascending: false }),
    supabase.from("local_service_categories").select("id,name,is_active,min_lead_price_cents,max_lead_price_cents").order("name"),
    supabase.from("local_service_disputes").select("id,status,reason,created_at,order_id").order("created_at", { ascending: false }).limit(10),
  ]);

  const pendingProviders = (providerRows.data ?? []).filter((provider: any) => provider.verification_status === "pending");
  const verifiedProviders = (providerRows.data ?? []).filter((provider: any) => provider.verification_status === "verified");

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
        <p className="hm-label text-hm-admin">Admin · Lokale Dienstleistungen</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Anbieter, Leads, Provisionen und Streitfaelle.</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric label="Anbieter" value={String(providerRows.data?.length ?? 0)} />
          <Metric label="Offene Freigaben" value={String(pendingProviders.length)} />
          <Metric label="Lead-Umsatz" value={formatLocalServiceMoney(dashboard.leadRevenue)} />
          <Metric label="Provisionen" value={formatLocalServiceMoney(dashboard.commissionRevenue + dashboard.serviceRevenue)} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.58fr_0.42fr]">
        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <h2 className="hm-display text-3xl text-hm-ink">Freigaben</h2>
          <div className="mt-4 grid gap-3">
            {pendingProviders.length ? pendingProviders.map((provider: any) => (
              <article key={provider.id} className="rounded-xl bg-hm-ivory p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-hm-ink">{provider.business_profiles?.display_name ?? provider.business_profiles?.legal_name ?? provider.business_profiles?.company ?? "Unternehmen"}</p>
                    <p className="mt-1 text-xs text-hm-inkSoft">Business {provider.business_profiles?.verification_status ?? "offen"} · {provider.base_city ?? "Ort offen"} · Radius {provider.service_radius_km ?? "-"} km</p>
                  </div>
                  <span className="rounded-pill bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{provider.verification_status}</span>
                </div>
                <div className="mt-4"><AdminProviderActionButtons providerId={provider.id} /></div>
              </article>
            )) : <p className="rounded-xl bg-hm-ivory px-4 py-6 text-sm text-hm-inkSoft">Keine offenen Anbieter-Freigaben.</p>}
          </div>
        </div>

        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <h2 className="hm-display text-3xl text-hm-ink">Status</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Line label="Verifizierte Anbieter" value={String(verifiedProviders.length)} />
            <Line label="Projekte" value={String(dashboard.projects.length)} />
            <Line label="Leads" value={String(dashboard.leads.length)} />
            <Line label="Auftraege" value={String(dashboard.orders.length)} />
            <Line label="Reviews" value={String(dashboard.reviews.length)} />
            <Line label="Offene Streitfaelle" value={String((dashboard.disputes ?? []).filter((item: any) => item.status === "open").length)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <h2 className="hm-display text-3xl text-hm-ink">Kategorien</h2>
          <div className="mt-4 grid gap-2">
            {(categories.data ?? []).map((category: any) => (
              <div key={category.id} className="flex items-center justify-between gap-4 rounded-xl bg-hm-ivory px-4 py-3">
                <span>
                  <span className="block text-sm font-bold text-hm-ink">{category.name}</span>
                  <span className="text-xs text-hm-inkSoft">{formatLocalServiceMoney(category.min_lead_price_cents)} bis {formatLocalServiceMoney(category.max_lead_price_cents)}</span>
                </span>
                <span className={`rounded-pill px-3 py-1 text-xs font-bold ${category.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{category.is_active ? "aktiv" : "aus"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
          <h2 className="hm-display text-3xl text-hm-ink">Streitfaelle</h2>
          <div className="mt-4 grid gap-2">
            {(disputes.data ?? []).length ? (disputes.data ?? []).map((dispute: any) => (
              <div key={dispute.id} className="rounded-xl bg-hm-ivory px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-hm-ink">{dispute.status}</span>
                  <span className="text-xs text-hm-inkSoft">{new Date(dispute.created_at).toLocaleDateString("de-DE")}</span>
                </div>
                <p className="mt-2 text-sm text-hm-inkSoft">{dispute.reason}</p>
              </div>
            )) : <p className="rounded-xl bg-hm-ivory px-4 py-6 text-sm text-hm-inkSoft">Keine Streitfaelle.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-hm-ivory px-4 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-hm-inkSoft">{label}</p>
      <p className="mt-2 text-2xl font-black text-hm-ink">{value}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hm-border/70 pb-2">
      <span className="font-semibold text-hm-ink">{label}</span>
      <span className="text-right text-hm-inkSoft">{value}</span>
    </div>
  );
}
