import type { RecommendationReason } from "./types";

const reasonLabels: Record<RecommendationReason, string> = {
  nearby: "In deiner Naehe",
  same_city: "Aus deiner Stadt",
  shared_event: "Gemeinsamer Event-Kontext",
  business_fit: "Passt zu deinem Business-Profil",
  service_fit: "Passt zu Dienstleistungen",
  active_project: "Passend zu aktivem Auftrag",
  trusted: "Geprueftes Trust-Signal",
  new_activity: "Neue Aktivitaet",
  upcoming: "Findet bald statt",
  benefit: "Mit Vorteil verbunden",
  complete_profile: "Profil ist gut gepflegt",
  community: "Passende Community",
};

export const getRecommendationReasonLabel = (reason: RecommendationReason) => reasonLabels[reason];

export const getPrimaryReasonLabel = (reasons: RecommendationReason[]) =>
  reasons.length ? getRecommendationReasonLabel(reasons[0]) : "Nachvollziehbare Empfehlung";
