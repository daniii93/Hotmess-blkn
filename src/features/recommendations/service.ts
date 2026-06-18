import "server-only";

import { getBusinessMe, getBusinessSuggestions, getJobListings } from "@/features/business/live-service";
import { getBenefitsData } from "@/features/benefits/service";
import { getCreatorData } from "@/features/creator/service";
import { getDigitalAiData } from "@/features/digital-ai/service";
import { getCurrentUserProfile, getPublishedEvents } from "@/features/events/live-service";
import { getLocalServiceCategories, getLocalServiceMe, getMyLocalServiceProjects, getProviderLeads } from "@/features/local-services/service";
import { getExploreData } from "@/features/social/live-service";
import { scoreReasons, sortRecommendations } from "./scoring";
import { canRecommendVerifiedOnly } from "./visibility";
import type { RecommendationContext, RecommendationItem, RecommendationReason } from "./types";

const safe = async <T>(fallback: T, loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch {
    return fallback;
  }
};

const item = (
  partial: Omit<RecommendationItem, "score"> & { reasons: RecommendationReason[] },
): RecommendationItem => ({
  ...partial,
  score: scoreReasons(partial.reasons),
});

export const getRecommendationData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const [events, explore, businessMe, businessSuggestions, jobs, localMe, localCategories, localProjects, providerLeads, benefits, creator, digitalAi] =
    await Promise.all([
      safe([], getPublishedEvents),
      safe({ people: [], hashtags: [], events: [] }, getExploreData),
      safe(null, getBusinessMe),
      safe([], () => getBusinessSuggestions(false)),
      safe([], getJobListings),
      safe(null, getLocalServiceMe),
      safe([], getLocalServiceCategories),
      safe([], getMyLocalServiceProjects),
      safe([], getProviderLeads),
      safe(null, getBenefitsData),
      safe(null, getCreatorData),
      safe(null, getDigitalAiData),
    ]);

  const context: RecommendationContext = {
    userId: profile?.id ?? null,
    city: profile?.city ?? null,
    verified: profile?.verification_status === "verified",
    businessEnabled: Boolean(profile?.business_enabled),
    datingEnabled: Boolean(profile?.dating_enabled),
    providerVerified: localMe?.providerProfile?.verificationStatus === "verified",
  };

  const now = Date.now();
  const recommendations: RecommendationItem[] = [];

  events.slice(0, 8).forEach((event) => {
    const upcoming = new Date(event.dateStart).getTime() >= now;
    const sameCity = Boolean(context.city && event.city?.toLowerCase() === context.city.toLowerCase());
    recommendations.push(item({
      id: `event:${event.id}`,
      kind: "event",
      title: event.title,
      text: `${event.city} - echte Eventdaten, Ticketstatus und Transparenz auf der Eventseite.`,
      href: `/events/${event.slug}`,
      reasons: [upcoming ? "upcoming" : "new_activity", sameCity ? "same_city" : "nearby", event.tables.length || event.drinkPackages.length ? "benefit" : "trusted"].filter(Boolean) as RecommendationReason[],
      source: "events",
    }));
  });

  explore.people.slice(0, 8).forEach((person) => {
    if (!canRecommendVerifiedOnly("verified")) return;
    recommendations.push(item({
      id: `person:${person.id}`,
      kind: "person",
      title: person.name,
      text: person.city ? `Verifiziertes Mitglied aus ${person.city}.` : "Verifiziertes Mitglied im HotMess Netzwerk.",
      href: `/u/${person.username}`,
      reasons: [person.city && context.city && person.city.toLowerCase() === context.city.toLowerCase() ? "same_city" : "trusted", "complete_profile"].filter(Boolean) as RecommendationReason[],
      source: "profiles",
    }));
  });

  businessSuggestions.slice(0, 6).forEach((suggestion) => {
    recommendations.push(item({
      id: `business:${suggestion.userId}`,
      kind: "business",
      title: suggestion.headline,
      text: suggestion.matchReason,
      href: "/business",
      reasons: ["business_fit", "trusted"],
      source: "business_profiles",
    }));
  });

  jobs.slice(0, 4).forEach((job) => {
    recommendations.push(item({
      id: `job:${job.id}`,
      kind: "job",
      title: job.title,
      text: `${job.company} - ${job.city ?? "Remote"}`,
      href: `/business/jobs/${job.id}`,
      reasons: ["business_fit", "new_activity"],
      source: "job_listings",
    }));
  });

  localProjects.slice(0, 4).forEach((project) => {
    recommendations.push(item({
      id: `project:${project.id}`,
      kind: "project",
      title: project.title,
      text: project.category?.name ? `Aktiver Auftrag in ${project.category.name}.` : "Aktiver Dienstleistungsauftrag.",
      href: `/local-services/customer/projects/${project.id}/offers`,
      reasons: ["active_project", "service_fit"],
      source: "local_service_projects",
    }));
  });

  providerLeads.slice(0, 4).forEach((lead) => {
    if (!lead.project) return;
    recommendations.push(item({
      id: `lead:${lead.id}`,
      kind: "service",
      title: lead.project.title,
      text: "Neuer Anbieter-Lead. Leadkosten bleiben nur im Anbieterbereich sichtbar.",
      href: `/local-services/company/leads/${lead.id}`,
      reasons: ["service_fit", "active_project"],
      source: "local_service_leads",
    }));
  });

  localCategories.slice(0, 6).forEach((category) => {
    recommendations.push(item({
      id: `service-category:${category.id}`,
      kind: "service",
      title: category.name,
      text: category.description ?? "Verifizierte Anbieter und Angebote in dieser Kategorie finden.",
      href: `/local-services/create?category=${category.id}`,
      reasons: ["service_fit", "nearby"],
      source: "local_service_categories",
    }));
  });

  benefits?.eventBenefits.slice(0, 4).forEach((benefit) => {
    recommendations.push(item({
      id: `benefit-event:${benefit.id}`,
      kind: "benefit",
      title: benefit.title,
      text: `${benefit.tables} Tischoptionen, ${benefit.drinkPackages} Drink Packages, ${benefit.birthdayPackages} Birthday Packages.`,
      href: `/events/${benefit.slug}`,
      reasons: ["benefit", "upcoming"],
      source: "benefits",
    }));
  });

  creator?.experts.slice(0, 4).forEach((expert) => {
    recommendations.push(item({
      id: `creator:${expert.userId}`,
      kind: "creator",
      title: expert.name,
      text: expert.headline,
      href: `/u/${expert.username}`,
      reasons: ["trusted", "business_fit"],
      source: "creator",
    }));
  });

  digitalAi?.providers.slice(0, 4).forEach((provider) => {
    recommendations.push(item({
      id: `digital:${provider.businessProfileId}`,
      kind: "digital",
      title: provider.company ?? provider.name,
      text: provider.headline,
      href: "/digital-ai",
      reasons: ["trusted", "business_fit"],
      source: "digital-ai",
    }));
  });

  const ranked = sortRecommendations(recommendations).slice(0, 18);

  return {
    context,
    profile,
    businessMe,
    localMe,
    recommendations: ranked,
    empty:
      "Noch nicht genuegend Signale vorhanden. Nutze Events, Connect, Business oder Dienstleistungen, damit HotMess dir bessere Empfehlungen zeigen kann.",
  };
};

export type RecommendationData = Awaited<ReturnType<typeof getRecommendationData>>;
