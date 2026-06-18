import "server-only";

import { getBenefitsData } from "@/features/benefits/service";
import { getCreatorData } from "@/features/creator/service";
import { getDigitalAiData } from "@/features/digital-ai/service";
import { getCurrentUserProfile, getPublishedEvents } from "@/features/events/live-service";
import { getLocalServiceCategories } from "@/features/local-services/service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CommunityItem } from "./types";

const safe = async <T>(fallback: T, loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch {
    return fallback;
  }
};

const safeRows = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T[]> => {
  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase.from(table).select(select);
    if (configure) query = configure(query);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as T[];
  } catch {
    return [];
  }
};

export const getCommunityData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const [groups, events, categories, creator, digitalAi, benefits] = await Promise.all([
    safeRows<any>("business_groups", "id,name,description,industry,city,member_count,is_private,conversation_id", (query) =>
      query.order("member_count", { ascending: false }).limit(16),
    ),
    safe([], getPublishedEvents),
    safe([], getLocalServiceCategories),
    safe(null, getCreatorData),
    safe(null, getDigitalAiData),
    safe(null, getBenefitsData),
  ]);

  const businessCommunities: CommunityItem[] = groups
    .filter((group) => !group.is_private)
    .map((group) => ({
      id: `business:${group.id}`,
      kind: "business",
      title: String(group.name ?? "Business Community"),
      text: String(group.description ?? group.industry ?? group.city ?? "Bestehende Business-Gruppe mit Chat-Struktur."),
      href: "/business/groups",
      memberCount: Number(group.member_count ?? 0),
      private: Boolean(group.is_private),
      source: "business_groups",
    }));

  const eventCommunities: CommunityItem[] = events.slice(0, 4).map((event) => ({
    id: `event:${event.id}`,
    kind: "event",
    title: `${event.title} Community`,
    text: `${event.city} - Event-Kontext, Tickets und Event-Chat bilden die Community-Grundlage.`,
    href: `/events/${event.slug}`,
    memberCount: event.genderConfig
      ? event.genderConfig.soldFemale + event.genderConfig.soldMale + event.genderConfig.soldDiverse
      : null,
    private: false,
    source: "events",
  }));

  const serviceCommunities: CommunityItem[] = categories.slice(0, 4).map((category) => ({
    id: `service:${category.id}`,
    kind: "service",
    title: `${category.name} Netzwerk`,
    text: "Dienstleister-Community wird aus echten Kategorien und Anbieterlogik abgeleitet.",
    href: `/local-services/create?category=${category.id}`,
    memberCount: null,
    private: false,
    source: "local_service_categories",
  }));

  const creatorCommunities: CommunityItem[] = (creator?.groups ?? []).slice(0, 4).map((group) => ({
    id: `creator:${group.id}`,
    kind: "creator",
    title: group.name,
    text: group.description ?? "Creator- und Expertenraum aus bestehenden Gruppen.",
    href: "/creator",
    memberCount: group.memberCount,
    private: false,
    source: "creator",
  }));

  const digitalCommunities: CommunityItem[] = (digitalAi?.digitalGroups ?? []).slice(0, 4).map((group) => ({
    id: `digital:${group.id}`,
    kind: "digital",
    title: group.name,
    text: group.description ?? "Digital-&-AI Fachcommunity aus bestehenden Gruppen.",
    href: "/digital-ai",
    memberCount: group.memberCount,
    private: false,
    source: "digital-ai",
  }));

  const memberCommunities: CommunityItem[] = benefits?.counts.activeDiscounts || benefits?.counts.partners
    ? [{
        id: "member:benefits",
        kind: "member",
        title: "HotMess Member Benefits",
        text: "Member-Community rund um echte Vorteile, Partner und Events.",
        href: "/benefits",
        memberCount: null,
        private: false,
        source: "benefits",
      }]
    : [];

  const communities = [
    ...businessCommunities,
    ...eventCommunities,
    ...serviceCommunities,
    ...creatorCommunities,
    ...digitalCommunities,
    ...memberCommunities,
  ].slice(0, 24);

  return {
    profile,
    communities,
    businessCommunities,
    eventCommunities,
    serviceCommunities,
    creatorCommunities,
    digitalCommunities,
    empty: "Communities werden sichtbar, sobald passende Gruppen oder Themenraeume verfuegbar sind.",
  };
};

export type CommunityData = Awaited<ReturnType<typeof getCommunityData>>;
