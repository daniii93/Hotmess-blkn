import "server-only";

import { createClient } from "@supabase/supabase-js";

const money = (cents: number) => `${Math.round(cents / 100).toLocaleString("de")} EUR`;

const hasSupabaseEnv = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY));

const supabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "", {
    auth: { autoRefreshToken: false, persistSession: false },
  });

const safeRows = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T[]> => {
  if (!hasSupabaseEnv()) return [];
  let query = supabase().from(table).select(select);
  if (configure) query = configure(query);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as T[];
};

const safeSingle = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T | null> => {
  if (!hasSupabaseEnv()) return null;
  let query = supabase().from(table).select(select);
  if (configure) query = configure(query);
  const { data, error } = await query.maybeSingle();
  if (error) return null;
  return (data ?? null) as T | null;
};

export type PartnerAccount = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  referral_code: string;
  referral_slug: string;
  tier: number;
  sponsor_id: string | null;
  business_name: string | null;
  tax_id: string | null;
  has_business_license: boolean;
  iban_encrypted: string | null;
  status: string;
};

export type PartnerBalance = {
  pending_cents: number;
  available_cents: number;
  paid_total_cents: number;
  reversed_total_cents: number;
  total_tickets_sold: number;
  own_tickets_sold: number;
  team_tickets_sold: number;
};

export type PartnerTier = {
  tier: number;
  name: string;
  own_commission_pct: number;
  required_own_sales: number;
  team_override_pct: number;
  description: string | null;
};

export type PartnerReferral = {
  id: string;
  commission_type: "own" | "team_override";
  commission_cents: number;
  commission_pct: number;
  ticket_revenue_cents: number;
  status: string;
  created_at: string;
  source_partner_id: string | null;
  attribution_method: string | null;
};

export type PartnerPayout = {
  id: string;
  amount_cents: number;
  status: string;
  requested_at: string;
  paid_at: string | null;
  rejection_reason: string | null;
};

export type PartnerMaterial = {
  title: string;
  type: string | null;
  url: string;
  description: string | null;
};

export type PartnerSnapshot = {
  partner: PartnerAccount;
  balance: PartnerBalance;
  tier: PartnerTier;
  nextTier: PartnerTier | null;
  referrals: PartnerReferral[];
  team: PartnerAccount[];
  payouts: PartnerPayout[];
  materials: PartnerMaterial[];
  tiers: PartnerTier[];
  kpis: Array<[string, string, string]>;
  activity: string[];
};

const demoPartner: PartnerAccount = {
  id: "demo-partner",
  first_name: "Ana",
  last_name: "Partner",
  email: "partner@hotmess-blkn.app",
  phone: "+43 000 000",
  referral_code: "ANA2024",
  referral_slug: "ana2024",
  tier: 3,
  sponsor_id: null,
  business_name: "Ana Marketing",
  tax_id: "ATU-DEMO",
  has_business_license: true,
  iban_encrypted: "stored",
  status: "active",
};

const demoTiers: PartnerTier[] = [
  { tier: 1, name: "Starter", own_commission_pct: 2, required_own_sales: 0, team_override_pct: 0, description: "Kostenloser Einstieg." },
  { tier: 2, name: "Promoter", own_commission_pct: 4, required_own_sales: 10, team_override_pct: 0, description: "Ab 10 eigenen Tickets." },
  { tier: 3, name: "Influencer", own_commission_pct: 6, required_own_sales: 30, team_override_pct: 1, description: "Team-Override auf echte Verkaeufe." },
  { tier: 4, name: "Manager", own_commission_pct: 8, required_own_sales: 75, team_override_pct: 2, description: "Starker Event-Vertrieb." },
  { tier: 5, name: "Director", own_commission_pct: 10, required_own_sales: 150, team_override_pct: 3, description: "Regionale Fuehrung." },
  { tier: 6, name: "Partner", own_commission_pct: 12, required_own_sales: 300, team_override_pct: 4, description: "Hoechste Stufe." },
];

const demoBalance: PartnerBalance = {
  pending_cents: 12800,
  available_cents: 34200,
  paid_total_cents: 234000,
  reversed_total_cents: 2500,
  total_tickets_sold: 47,
  own_tickets_sold: 38,
  team_tickets_sold: 9,
};

const demoReferrals: PartnerReferral[] = [
  { id: "r1", commission_type: "own", commission_cents: 150, commission_pct: 6, ticket_revenue_cents: 2500, status: "pending", created_at: new Date().toISOString(), source_partner_id: demoPartner.id, attribution_method: "link" },
  { id: "r2", commission_type: "team_override", commission_cents: 30, commission_pct: 1, ticket_revenue_cents: 3000, status: "confirmed", created_at: new Date().toISOString(), source_partner_id: "marko", attribution_method: "code" },
];

const buildSnapshot = (
  partner: PartnerAccount,
  balance: PartnerBalance,
  tiers: PartnerTier[],
  referrals: PartnerReferral[],
  team: PartnerAccount[],
  payouts: PartnerPayout[],
  materials: PartnerMaterial[],
): PartnerSnapshot => {
  const tier = tiers.find((item) => item.tier === partner.tier) ?? demoTiers[0];
  const nextTier = tiers.find((item) => item.tier > partner.tier) ?? null;
  return {
    partner,
    balance,
    tier,
    nextTier,
    referrals,
    team,
    payouts,
    materials,
    tiers,
    kpis: [
      ["Verfuegbar", money(balance.available_cents), "Auszahlen"],
      ["Ausstehend", money(balance.pending_cents), "nach Event bestaetigt"],
      ["Diese Stufe", tier.name, `${tier.own_commission_pct}% eigen`],
      ["Verkaeufe gesamt", `${balance.total_tickets_sold} Tickets`, `${balance.own_tickets_sold} eigen / ${balance.team_tickets_sold} Team`],
    ],
    activity: [
      ...referrals.slice(0, 4).map((ref) => `${ref.commission_type === "team_override" ? "Team-Verkauf" : "Verkauf"} - ${ref.status} - +${money(ref.commission_cents)}`),
      nextTier ? `Naechste Stufe: ${nextTier.name} ab ${nextTier.required_own_sales} eigenen Tickets` : "Hoechste Stufe erreicht",
    ],
  };
};

export const getPartnerSnapshot = async (code?: string): Promise<PartnerSnapshot> => {
  const partner =
    (await safeSingle<PartnerAccount>("partners", "id,first_name,last_name,email,phone,referral_code,referral_slug,tier,sponsor_id,business_name,tax_id,has_business_license,iban_encrypted,status", (q) =>
      code ? q.ilike("referral_code", code) : q.eq("status", "active").order("created_at", { ascending: false }).limit(1),
    )) ?? demoPartner;

  const [balance, tiers, referrals, team, payouts, materials] = await Promise.all([
    safeSingle<PartnerBalance>("partner_balances", "pending_cents,available_cents,paid_total_cents,reversed_total_cents,total_tickets_sold,own_tickets_sold,team_tickets_sold", (q) => q.eq("partner_id", partner.id)),
    safeRows<PartnerTier>("partner_tiers", "tier,name,own_commission_pct,required_own_sales,team_override_pct,description", (q) => q.order("tier", { ascending: true })),
    safeRows<PartnerReferral>("partner_referrals", "id,commission_type,commission_cents,commission_pct,ticket_revenue_cents,status,created_at,source_partner_id,attribution_method", (q) => q.eq("partner_id", partner.id).order("created_at", { ascending: false }).limit(25)),
    safeRows<PartnerAccount>("partners", "id,first_name,last_name,email,phone,referral_code,referral_slug,tier,sponsor_id,business_name,tax_id,has_business_license,iban_encrypted,status", (q) => q.eq("sponsor_id", partner.id).order("created_at", { ascending: false }).limit(20)),
    safeRows<PartnerPayout>("partner_payouts", "id,amount_cents,status,requested_at,paid_at,rejection_reason", (q) => q.eq("partner_id", partner.id).order("requested_at", { ascending: false }).limit(20)),
    safeRows<PartnerMaterial>("partner_materials", "title,type,url,description", (q) => q.eq("is_active", true).order("created_at", { ascending: false }).limit(20)),
  ]);

  return buildSnapshot(partner, balance ?? demoBalance, tiers.length ? tiers : demoTiers, referrals.length ? referrals : demoReferrals, team, payouts, materials);
};

export const trackPartnerClick = async (code: string, attributionMethod: "link" | "qr" | "landing", eventId?: string) => {
  if (!hasSupabaseEnv()) return { tracked: false };
  const { data: partner } = await supabase().from("partners").select("id").ilike("referral_code", code).maybeSingle();
  if (!partner) return { tracked: false };
  await supabase().from("partner_link_clicks").insert({ partner_id: partner.id, attribution_method: attributionMethod, event_id: eventId ?? null });
  return { tracked: true, partnerId: partner.id as string };
};

export const mainAppUrl = () => (process.env.NEXT_PUBLIC_MAIN_APP_URL || "https://www.hotmess-blkn.app").replace(/\/$/, "");

