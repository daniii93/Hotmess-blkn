import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminPartnerProgramRow = {
  id: string;
  name: string;
  code: string;
  level: string;
  tickets: number;
  commission: number;
  pending: number;
  status: string;
};

export type AdminPartnerPayoutRow = {
  id: string;
  partnerName: string;
  amount: number;
  status: string;
};

export type AdminPartnerTierRow = {
  level: number;
  name: string;
  own: string;
  threshold: string;
  override: string;
};

export type AdminPartnerMaterialRow = {
  title: string;
  type: string;
};

export type AdminPartnerProgramSnapshot = {
  partners: AdminPartnerProgramRow[];
  payouts: AdminPartnerPayoutRow[];
  materials: AdminPartnerMaterialRow[];
  tiers: AdminPartnerTierRow[];
  totals: {
    pending: number;
    confirmed: number;
    paid: number;
  };
};

const safeRows = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T[]> => {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select(select);
  if (configure) query = configure(query);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as T[];
};

export const getAdminPartnerProgramSnapshot = async (): Promise<AdminPartnerProgramSnapshot> => {
  const [partners, balances, payouts, referrals, tiers, materials] = await Promise.all([
    safeRows<any>("partners", "id,first_name,last_name,referral_code,tier,status", (q) => q.order("created_at", { ascending: false }).limit(100)),
    safeRows<any>("partner_balances", "partner_id,pending_cents,available_cents,paid_total_cents,total_tickets_sold"),
    safeRows<any>("partner_payouts", "id,partner_id,amount_cents,status", (q) => q.order("requested_at", { ascending: false }).limit(50)),
    safeRows<any>("partner_referrals", "commission_cents,status"),
    safeRows<any>("partner_tiers", "tier,name,own_commission_pct,required_own_sales,team_override_pct", (q) => q.order("tier", { ascending: true })),
    safeRows<any>("partner_materials", "title,type,is_active", (q) => q.order("created_at", { ascending: false }).limit(20)),
  ]);

  const balanceByPartner = new Map(balances.map((balance) => [balance.partner_id, balance]));
  const partnerById = new Map(partners.map((partner) => [partner.id, partner]));

  return {
    partners: partners.map((partner) => {
      const balance = balanceByPartner.get(partner.id);
      return {
        id: partner.id,
        name: `${partner.first_name ?? ""} ${partner.last_name ?? ""}`.trim() || "Partner",
        code: partner.referral_code ?? "-",
        level: `Stufe ${partner.tier ?? 1}`,
        tickets: Number(balance?.total_tickets_sold ?? 0),
        commission: Number(balance?.paid_total_cents ?? 0) / 100,
        pending: Number(balance?.pending_cents ?? 0) / 100,
        status: partner.status ?? "pending",
      };
    }),
    payouts: payouts.map((payout) => {
      const partner = partnerById.get(payout.partner_id);
      return {
        id: payout.id,
        partnerName: partner ? `${partner.first_name ?? ""} ${partner.last_name ?? ""}`.trim() : "Partner",
        amount: Number(payout.amount_cents ?? 0) / 100,
        status: payout.status ?? "requested",
      };
    }),
    materials: materials.map((material) => ({ title: material.title, type: material.type ?? "Material" })),
    tiers: tiers.map((tier) => ({
      level: Number(tier.tier),
      name: tier.name,
      own: `${Number(tier.own_commission_pct ?? 0)}%`,
      threshold: `${Number(tier.required_own_sales ?? 0)} Tickets`,
      override: `${Number(tier.team_override_pct ?? 0)}% Team`,
    })),
    totals: {
      pending: referrals.filter((ref) => ref.status === "pending").reduce((sum, ref) => sum + Number(ref.commission_cents ?? 0), 0) / 100,
      confirmed: referrals.filter((ref) => ref.status === "confirmed").reduce((sum, ref) => sum + Number(ref.commission_cents ?? 0), 0) / 100,
      paid: referrals.filter((ref) => ref.status === "paid").reduce((sum, ref) => sum + Number(ref.commission_cents ?? 0), 0) / 100,
    },
  };
};

