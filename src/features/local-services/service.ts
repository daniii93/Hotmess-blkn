import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile, getRequestUserProfile } from "@/features/events/live-service";

export type LocalServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  minLeadPriceCents: number;
  maxLeadPriceCents: number;
  commissionRate: number;
  requiredDocuments: string[];
  businessKeywords: string[];
};

export type LocalServiceMe = {
  userId: string;
  verified: boolean;
  isBanned: boolean;
  businessEnabled: boolean;
  role: string;
  businessProfile: {
    id: string;
    displayName: string;
    verificationStatus: string;
    moduleActive: boolean;
    industry: string | null;
    offeringTags: string[];
    company: string | null;
    headline: string | null;
  } | null;
  providerProfile: LocalServiceProvider | null;
};

export type LocalServiceProvider = {
  id: string;
  businessProfileId: string;
  description: string | null;
  serviceRadiusKm: number | null;
  baseCity: string | null;
  baseZip: string | null;
  emergencyService: boolean;
  onsiteVisit: boolean;
  insuranceAvailable: boolean;
  minOrderCents: number | null;
  hourlyRateCents: number | null;
  verificationStatus: string;
  ratingAvg: number | null;
  ratingCount: number;
  trustScore: number;
  categories: LocalServiceCategory[];
};

export type LocalServiceProject = {
  id: string;
  customerId: string;
  categoryId: string | null;
  title: string;
  description: string;
  budgetCents: number | null;
  urgency: string | null;
  desiredTimeline: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  radiusKm: number | null;
  contactPreference: string | null;
  requestType: string;
  requesterBusinessProfileId: string | null;
  allowSameCategorySubcontract: boolean;
  subcontractScope: string | null;
  status: string;
  createdAt: string;
  category: LocalServiceCategory | null;
};

export type LocalServiceLead = {
  id: string;
  projectId: string;
  providerId: string;
  priceCents: number;
  estimatedProjectValueCents: number | null;
  status: string;
  purchasedAt: string | null;
  createdAt: string;
  project: LocalServiceProject | null;
};

export type LocalServiceOffer = {
  id: string;
  projectId: string;
  providerId: string;
  title: string;
  description: string;
  laborCostCents: number;
  materialCostCents: number;
  otherCostCents: number;
  taxCents: number;
  totalPriceCents: number;
  validUntil: string | null;
  startDate: string | null;
  durationDays: number | null;
  paymentTerms: string | null;
  status: string;
  createdAt: string;
};

export type LocalServiceOrder = {
  id: string;
  projectId: string;
  offerId: string | null;
  customerId: string | null;
  providerId: string | null;
  status: string;
  totalAmountCents: number;
  commissionAmountCents: number;
  serviceFeeCents: number;
  payoutAmountCents: number;
  createdAt: string;
};

const moneyToCents = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round(number * 100);
};

const mapCategory = (row: any): LocalServiceCategory => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? null,
  icon: row.icon ?? null,
  minLeadPriceCents: row.min_lead_price_cents ?? 500,
  maxLeadPriceCents: row.max_lead_price_cents ?? 25000,
  commissionRate: Number(row.commission_rate ?? 8),
  requiredDocuments: row.required_documents ?? [],
  businessKeywords: row.business_keywords ?? [],
});

const mapProject = (row: any): LocalServiceProject => ({
  id: row.id,
  customerId: row.customer_id,
  categoryId: row.category_id ?? null,
  title: row.title,
  description: row.description,
  budgetCents: row.budget_cents ?? null,
  urgency: row.urgency ?? null,
  desiredTimeline: row.desired_timeline ?? null,
  address: row.address ?? null,
  city: row.city ?? null,
  zip: row.zip ?? null,
  country: row.country ?? null,
  radiusKm: row.radius_km ?? null,
  contactPreference: row.contact_preference ?? null,
  requestType: row.request_type ?? "private",
  requesterBusinessProfileId: row.requester_business_profile_id ?? null,
  allowSameCategorySubcontract: Boolean(row.allow_same_category_subcontract),
  subcontractScope: row.subcontract_scope ?? null,
  status: row.status,
  createdAt: row.created_at,
  category: row.local_service_categories ? mapCategory(row.local_service_categories) : null,
});

const mapProvider = (row: any): LocalServiceProvider => ({
  id: row.id,
  businessProfileId: row.business_profile_id,
  description: row.description ?? null,
  serviceRadiusKm: row.service_radius_km ?? null,
  baseCity: row.base_city ?? null,
  baseZip: row.base_zip ?? null,
  emergencyService: Boolean(row.emergency_service),
  onsiteVisit: Boolean(row.onsite_visit),
  insuranceAvailable: Boolean(row.insurance_available),
  minOrderCents: row.min_order_cents ?? null,
  hourlyRateCents: row.hourly_rate_cents ?? null,
  verificationStatus: row.verification_status ?? "pending",
  ratingAvg: row.rating_avg === null ? null : Number(row.rating_avg),
  ratingCount: row.rating_count ?? 0,
  trustScore: row.trust_score ?? 60,
  categories: (row.local_service_provider_categories ?? [])
    .map((item: any) => item.local_service_categories ? mapCategory(item.local_service_categories) : null)
    .filter(Boolean),
});

const mapLead = (row: any): LocalServiceLead => ({
  id: row.id,
  projectId: row.project_id,
  providerId: row.provider_id,
  priceCents: row.price_cents,
  estimatedProjectValueCents: row.estimated_project_value_cents ?? null,
  status: row.status,
  purchasedAt: row.purchased_at ?? null,
  createdAt: row.created_at,
  project: row.local_service_projects ? mapProject(row.local_service_projects) : null,
});

const mapOffer = (row: any): LocalServiceOffer => ({
  id: row.id,
  projectId: row.project_id,
  providerId: row.provider_id,
  title: row.title,
  description: row.description,
  laborCostCents: row.labor_cost_cents ?? 0,
  materialCostCents: row.material_cost_cents ?? 0,
  otherCostCents: row.other_cost_cents ?? 0,
  taxCents: row.tax_cents ?? 0,
  totalPriceCents: row.total_price_cents,
  validUntil: row.valid_until ?? null,
  startDate: row.start_date ?? null,
  durationDays: row.duration_days ?? null,
  paymentTerms: row.payment_terms ?? null,
  status: row.status,
  createdAt: row.created_at,
});

const mapOrder = (row: any): LocalServiceOrder => ({
  id: row.id,
  projectId: row.project_id,
  offerId: row.offer_id,
  customerId: row.customer_id,
  providerId: row.provider_id,
  status: row.status,
  totalAmountCents: row.total_amount_cents,
  commissionAmountCents: row.commission_amount_cents,
  serviceFeeCents: row.service_fee_cents ?? 0,
  payoutAmountCents: row.payout_amount_cents,
  createdAt: row.created_at,
});

export const formatLocalServiceMoney = (cents: number | null | undefined) =>
  cents === null || cents === undefined ? "offen" : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export const getLocalServiceCategories = async (): Promise<LocalServiceCategory[]> => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("local_service_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCategory);
};

const normalizeTerm = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const businessTerms = (business: LocalServiceMe["businessProfile"]) => {
  if (!business) return [];
  return [
    business.industry,
    business.company,
    business.headline,
    business.displayName,
    ...business.offeringTags,
  ]
    .filter(Boolean)
    .flatMap((item) => normalizeTerm(String(item)).split(" "))
    .filter((term) => term.length >= 3);
};

export const isCategoryAllowedForBusiness = (category: LocalServiceCategory, business: LocalServiceMe["businessProfile"]) => {
  const terms = businessTerms(business);
  if (terms.length === 0) return false;
  const keywords = category.businessKeywords.map(normalizeTerm).flatMap((keyword) => keyword.split(" ")).filter(Boolean);
  if (keywords.length === 0) return true;
  return keywords.some((keyword) => terms.includes(keyword) || terms.some((term) => term.includes(keyword) || keyword.includes(term)));
};

export const getAllowedLocalServiceCategories = (categories: LocalServiceCategory[], business: LocalServiceMe["businessProfile"]) =>
  categories.filter((category) => isCategoryAllowedForBusiness(category, business));

export const getLocalServiceMe = async (): Promise<LocalServiceMe | null> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  const supabase = createSupabaseAdminClient();
  const { data: business } = await supabase
    .from("business_profiles")
    .select("id,user_id,owner_user_id,display_name,legal_name,company,headline,industry,offering_tags,verification_status,business_profile_modules(module_key,is_active)")
    .or(`user_id.eq.${profile.id},owner_user_id.eq.${profile.id}`)
    .maybeSingle();

  let provider: LocalServiceProvider | null = null;
  if (business?.id) {
    const { data: providerRow } = await supabase
      .from("local_service_provider_profiles")
      .select("*,local_service_provider_categories(local_service_categories(*))")
      .eq("business_profile_id", business.id)
      .maybeSingle();
    provider = providerRow ? mapProvider(providerRow) : null;
  }

  const moduleActive = Boolean((business?.business_profile_modules ?? []).some((module: any) => module.module_key === "local_services" && module.is_active));

  return {
    userId: profile.id,
    verified: profile.verification_status === "verified",
    isBanned: Boolean(profile.is_banned),
    businessEnabled: Boolean(profile.business_enabled),
    role: profile.role ?? "user",
    businessProfile: business
      ? {
          id: business.id,
          displayName: business.display_name ?? business.legal_name ?? business.company ?? business.headline ?? "Unternehmen",
          verificationStatus: business.verification_status ?? "pending",
          moduleActive,
          industry: business.industry ?? null,
          offeringTags: business.offering_tags ?? [],
          company: business.company ?? null,
          headline: business.headline ?? null,
        }
      : null,
    providerProfile: provider,
  };
};

export const calculateLeadPrice = (category: LocalServiceCategory | null, budgetCents: number | null, urgency: string | null) => {
  const min = category?.minLeadPriceCents ?? 500;
  const max = category?.maxLeadPriceCents ?? 25000;
  const budgetFactor = budgetCents ? Math.min(max, Math.max(min, Math.round(budgetCents * 0.015))) : min;
  const urgencyFactor = urgency === "immediate" ? 1.4 : urgency === "this_week" ? 1.2 : 1;
  return Math.min(max, Math.max(min, Math.round(budgetFactor * urgencyFactor)));
};

export const submitLocalServiceProvider = async (input: {
  categories: string[];
  description: string;
  baseCity: string;
  baseZip: string;
  serviceRadiusKm: number;
  emergencyService: boolean;
  onsiteVisit: boolean;
  insuranceAvailable: boolean;
  minOrderEuro?: number | null;
  hourlyRateEuro?: number | null;
}) => {
  const me = await getLocalServiceMe();
  if (!me) throw new Error("Bitte zuerst einloggen.");
  if (!me.verified) throw new Error("Verifizierung erforderlich.");
  if (!me.businessProfile) throw new Error("Bitte zuerst ein Unternehmensprofil anlegen.");
  if (me.businessProfile.verificationStatus !== "verified") throw new Error("Dein Unternehmensprofil muss zuerst geprueft werden.");

  const supabase = createSupabaseAdminClient();
  const categories = await getLocalServiceCategories();
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const blocked = input.categories
    .map((id) => categoryMap.get(id))
    .filter((category): category is LocalServiceCategory => Boolean(category))
    .filter((category) => !isCategoryAllowedForBusiness(category, me.businessProfile));
  if (blocked.length) {
    throw new Error(`Diese Kategorie passt nicht zu deinem Firmenprofil: ${blocked.map((category) => category.name).join(", ")}.`);
  }

  const { data: provider, error } = await supabase
    .from("local_service_provider_profiles")
    .upsert(
      {
        business_profile_id: me.businessProfile.id,
        description: input.description,
        base_city: input.baseCity,
        base_zip: input.baseZip,
        service_radius_km: input.serviceRadiusKm,
        emergency_service: input.emergencyService,
        onsite_visit: input.onsiteVisit,
        insurance_available: input.insuranceAvailable,
        min_order_cents: moneyToCents(input.minOrderEuro),
        hourly_rate_cents: moneyToCents(input.hourlyRateEuro),
        verification_status: me.businessProfile.moduleActive ? "verified" : "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_profile_id" },
    )
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await supabase.from("local_service_provider_categories").delete().eq("provider_id", provider.id);
  if (input.categories.length) {
    await supabase.from("local_service_provider_categories").insert(
      input.categories.map((categoryId) => ({
        provider_id: provider.id,
        category_id: categoryId,
      })),
    );
  }

  await supabase.from("local_service_audit").insert({
    actor_id: me.userId,
    action: "provider_submitted",
    target_type: "local_service_provider",
    target_id: provider.id,
    after_state: input,
  });

  return provider.id as string;
};

export const createLocalServiceProject = async (input: {
  categoryId: string;
  title: string;
  description: string;
  desiredTimeline?: string | null;
  budgetEuro?: number | null;
  urgency: "immediate" | "this_week" | "this_month" | "flexible";
  address?: string | null;
  zip?: string | null;
  city: string;
  country: string;
  radiusKm?: number | null;
  contactPreference: "platform_chat" | "phone_after_acceptance" | "platform_visit";
  requestType?: "private" | "company" | "subcontract";
  allowSameCategorySubcontract?: boolean;
  subcontractScope?: string | null;
}) => {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("Bitte zuerst einloggen.");
  if (profile.verification_status !== "verified") throw new Error("Verifizierung erforderlich.");

  const supabase = createSupabaseAdminClient();
  const { data: category } = await supabase.from("local_service_categories").select("*").eq("id", input.categoryId).maybeSingle();
  const budgetCents = moneyToCents(input.budgetEuro);
  const me = await getLocalServiceMe();
  const requesterBusinessId = input.requestType && input.requestType !== "private" ? me?.businessProfile?.id ?? null : null;
  if (input.requestType && input.requestType !== "private") {
    if (!me?.businessProfile || me.businessProfile.verificationStatus !== "verified") {
      throw new Error("Firmen- oder Subunternehmerauftraege brauchen ein verifiziertes Unternehmensprofil.");
    }
  }

  let ownProviderCategoryIds = new Set<string>();
  if (me?.providerProfile) {
    ownProviderCategoryIds = new Set(me.providerProfile.categories.map((item) => item.id));
  }
  const sameCategoryAsOwnBusiness = ownProviderCategoryIds.has(input.categoryId);
  const subcontract = input.requestType === "subcontract" && input.allowSameCategorySubcontract;
  if (sameCategoryAsOwnBusiness && input.requestType !== "private" && !subcontract) {
    throw new Error("Gleiche Dienstleistungskategorie ist nur als eindeutig markierter Subunternehmerauftrag moeglich.");
  }
  if (subcontract && (!input.subcontractScope || input.subcontractScope.trim().length < 20)) {
    throw new Error("Bitte beschreibe das Bauvorhaben und die Subunternehmerleistung sichtbar fuer angefragte Anbieter.");
  }

  const { data: project, error } = await supabase
    .from("local_service_projects")
    .insert({
      customer_id: profile.id,
      category_id: input.categoryId,
      title: input.title,
      description: input.description,
      desired_timeline: input.desiredTimeline || null,
      budget_cents: budgetCents,
      urgency: input.urgency,
      address: input.address || null,
      zip: input.zip || null,
      city: input.city,
      country: input.country,
      radius_km: input.radiusKm ?? 10,
      contact_preference: input.contactPreference,
      requester_business_profile_id: requesterBusinessId,
      request_type: input.requestType ?? "private",
      allow_same_category_subcontract: Boolean(subcontract),
      subcontract_scope: input.subcontractScope || null,
      status: "open",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { data: providers } = await supabase
    .from("local_service_provider_profiles")
    .select("id,service_radius_km,local_service_provider_categories(category_id)")
    .eq("verification_status", "verified")
    .limit(50);

  const matchingProviders = (providers ?? []).filter((provider: any) =>
    provider.id !== me?.providerProfile?.id &&
    (provider.local_service_provider_categories ?? []).some((item: any) => item.category_id === input.categoryId),
  );

  const leadPrice = calculateLeadPrice(category ? mapCategory(category) : null, budgetCents, input.urgency);
  if (matchingProviders.length) {
    await supabase.from("local_service_leads").upsert(
      matchingProviders.map((provider: any) => ({
        project_id: project.id,
        provider_id: provider.id,
        price_cents: leadPrice,
        estimated_project_value_cents: budgetCents,
        status: "available",
      })),
      { onConflict: "project_id,provider_id" },
    );
  }

  await supabase.from("local_service_audit").insert({
    actor_id: profile.id,
    action: "project_created",
    target_type: "local_service_project",
    target_id: project.id,
    after_state: { ...input, matchedProviders: matchingProviders.length },
  });

  return project.id as string;
};

export const getMyLocalServiceProjects = async () => {
  const profile = await getCurrentUserProfile();
  if (!profile) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("local_service_projects")
    .select("*,local_service_categories(*)")
    .eq("customer_id", profile.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProject);
};

export const getLocalServiceProject = async (id: string) => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("local_service_projects")
    .select("*,local_service_categories(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProject(data) : null;
};

export const getProviderLeads = async () => {
  const me = await getLocalServiceMe();
  if (!me?.providerProfile) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("local_service_leads")
    .select("*,local_service_projects(*,local_service_categories(*))")
    .eq("provider_id", me.providerProfile.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapLead);
};

export const getProviderLead = async (id: string) => {
  const me = await getLocalServiceMe();
  if (!me?.providerProfile) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("local_service_leads")
    .select("*,local_service_projects(*,local_service_categories(*))")
    .eq("id", id)
    .eq("provider_id", me.providerProfile.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapLead(data) : null;
};

export const purchaseLocalServiceLead = async (leadId: string, request?: Request) => {
  const profile = request ? await getRequestUserProfile(request) : await getCurrentUserProfile();
  if (!profile) throw new Error("Bitte zuerst einloggen.");
  if (profile.verification_status !== "verified") throw new Error("Verifizierung erforderlich.");

  const supabase = createSupabaseAdminClient();
  const me = await getLocalServiceMe();
  if (!me?.providerProfile || me.providerProfile.verificationStatus !== "verified") throw new Error("Anbieter-Freischaltung erforderlich.");

  const { data: lead, error: leadError } = await supabase
    .from("local_service_leads")
    .select("*,local_service_projects(customer_id,title,status)")
    .eq("id", leadId)
    .eq("provider_id", me.providerProfile.id)
    .maybeSingle();
  if (leadError) throw new Error(leadError.message);
  if (!lead) throw new Error("Lead nicht gefunden.");
  if (!["available", "viewed"].includes(lead.status)) throw new Error("Lead ist nicht mehr verfuegbar.");

  const { data: conversation } = await supabase
    .from("conversations")
    .insert({
      type: "direct",
      name: `Auftrag: ${lead.local_service_projects?.title ?? "Lokale Dienstleistung"}`,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (conversation?.id) {
    await supabase.from("conversation_members").upsert([
      { conversation_id: conversation.id, user_id: profile.id, role: "member" },
      { conversation_id: conversation.id, user_id: lead.local_service_projects.customer_id, role: "member" },
    ]);
  }

  const { error } = await supabase
    .from("local_service_leads")
    .update({
      status: "purchased",
      purchased_at: new Date().toISOString(),
      conversation_id: conversation?.id ?? null,
    })
    .eq("id", leadId);
  if (error) throw new Error(error.message);

  await supabase.from("local_service_payments").insert({
    amount_cents: lead.price_cents,
    type: "lead_fee",
    status: "paid",
  });
  await supabase.from("local_service_projects").update({ status: "lead_purchased" }).eq("id", lead.project_id);
  await supabase.from("local_service_audit").insert({
    actor_id: profile.id,
    action: "lead_purchased",
    target_type: "local_service_lead",
    target_id: leadId,
    after_state: { price_cents: lead.price_cents, conversation_id: conversation?.id ?? null },
  });

  return { conversationId: conversation?.id ?? null };
};

export const createLocalServiceOffer = async (input: {
  projectId: string;
  title: string;
  description: string;
  laborEuro?: number | null;
  materialEuro?: number | null;
  otherEuro?: number | null;
  taxEuro?: number | null;
  validUntil?: string | null;
  startDate?: string | null;
  durationDays?: number | null;
  paymentTerms?: string | null;
}) => {
  const me = await getLocalServiceMe();
  if (!me?.providerProfile) throw new Error("Anbieter-Freischaltung erforderlich.");

  const labor = moneyToCents(input.laborEuro) ?? 0;
  const material = moneyToCents(input.materialEuro) ?? 0;
  const other = moneyToCents(input.otherEuro) ?? 0;
  const tax = moneyToCents(input.taxEuro) ?? 0;
  const total = labor + material + other + tax;
  if (total <= 0) throw new Error("Gesamtpreis erforderlich.");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("local_service_offers")
    .insert({
      project_id: input.projectId,
      provider_id: me.providerProfile.id,
      title: input.title,
      description: input.description,
      labor_cost_cents: labor,
      material_cost_cents: material,
      other_cost_cents: other,
      tax_cents: tax,
      total_price_cents: total,
      valid_until: input.validUntil || null,
      start_date: input.startDate || null,
      duration_days: input.durationDays ?? null,
      payment_terms: input.paymentTerms || null,
      status: "sent",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await supabase.from("local_service_projects").update({ status: "offer_sent" }).eq("id", input.projectId);
  return data.id as string;
};

export const getProjectOffers = async (projectId: string) => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("local_service_offers")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOffer);
};

export const acceptLocalServiceOffer = async (offerId: string) => {
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("Bitte zuerst einloggen.");
  const supabase = createSupabaseAdminClient();
  const { data: offer, error: offerError } = await supabase.from("local_service_offers").select("*").eq("id", offerId).maybeSingle();
  if (offerError) throw new Error(offerError.message);
  if (!offer) throw new Error("Angebot nicht gefunden.");

  const { data: project } = await supabase.from("local_service_projects").select("*").eq("id", offer.project_id).eq("customer_id", profile.id).maybeSingle();
  if (!project) throw new Error("Auftrag nicht gefunden.");

  const commission = Math.round(offer.total_price_cents * 0.08);
  const serviceFee = Math.round(offer.total_price_cents * 0.02);
  const payout = Math.max(0, offer.total_price_cents - commission);

  const { data: order, error } = await supabase
    .from("local_service_orders")
    .insert({
      project_id: offer.project_id,
      offer_id: offer.id,
      customer_id: profile.id,
      provider_id: offer.provider_id,
      status: "payment_pending",
      total_amount_cents: offer.total_price_cents,
      commission_rate: 8,
      commission_amount_cents: commission,
      service_fee_cents: serviceFee,
      payout_amount_cents: payout,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await Promise.all([
    supabase.from("local_service_offers").update({ status: "accepted" }).eq("id", offer.id),
    supabase.from("local_service_projects").update({ status: "offer_accepted" }).eq("id", offer.project_id),
  ]);

  return order.id as string;
};

export const getLocalServiceOrder = async (id: string) => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("local_service_orders").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOrder(data) : null;
};

export const getMyLocalServiceOrders = async () => {
  const profile = await getCurrentUserProfile();
  if (!profile) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("local_service_orders")
    .select("*")
    .or(`customer_id.eq.${profile.id}`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOrder);
};

export const updateLocalServiceOrderStatus = async (id: string, status: string) => {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("local_service_orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
};

export const getLocalServicesAdminDashboard = async () => {
  const supabase = createSupabaseAdminClient();
  const [providers, projects, leads, orders, disputes, reviews] = await Promise.all([
    supabase.from("local_service_provider_profiles").select("id,verification_status", { count: "exact", head: false }),
    supabase.from("local_service_projects").select("id,status", { count: "exact", head: false }),
    supabase.from("local_service_leads").select("id,status,price_cents", { count: "exact", head: false }),
    supabase.from("local_service_orders").select("id,status,total_amount_cents,commission_amount_cents,service_fee_cents", { count: "exact", head: false }),
    supabase.from("local_service_disputes").select("id,status", { count: "exact", head: false }),
    supabase.from("local_service_reviews").select("id,rating", { count: "exact", head: false }),
  ]);
  const leadRevenue = (leads.data ?? []).filter((lead: any) => lead.status === "purchased").reduce((sum: number, lead: any) => sum + (lead.price_cents ?? 0), 0);
  const commissionRevenue = (orders.data ?? []).reduce((sum: number, order: any) => sum + (order.commission_amount_cents ?? 0), 0);
  const serviceRevenue = (orders.data ?? []).reduce((sum: number, order: any) => sum + (order.service_fee_cents ?? 0), 0);
  return {
    providers: providers.data ?? [],
    projects: projects.data ?? [],
    leads: leads.data ?? [],
    orders: orders.data ?? [],
    disputes: disputes.data ?? [],
    reviews: reviews.data ?? [],
    leadRevenue,
    commissionRevenue,
    serviceRevenue,
  };
};
