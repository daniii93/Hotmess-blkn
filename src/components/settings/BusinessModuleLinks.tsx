import Link from "next/link";
import { Bot, BriefcaseBusiness, CalendarDays, HeartHandshake, Sparkles, Utensils, Wrench } from "lucide-react";
import type { ComponentType } from "react";

export type BusinessModuleKey =
  | "business"
  | "creator_business"
  | "local_services"
  | "ai_marketplace"
  | "eat_restaurant"
  | "event_vendor"
  | "dating_entrepreneur";

export type BusinessModuleState = {
  module_key: BusinessModuleKey;
  is_active: boolean;
};

const moduleConfig: Record<BusinessModuleKey, {
  title: string;
  detail: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}> = {
  business: {
    title: "Business Basis",
    detail: "Networking, Business-Profil und Kontakte",
    href: "/business",
    icon: BriefcaseBusiness,
  },
  creator_business: {
    title: "Creator Business",
    detail: "Digitale Produkte, Coachings und Premium-Inhalte",
    href: "/business/profile?module=creator_business",
    icon: Sparkles,
  },
  local_services: {
    title: "Lokale Dienstleistungen",
    detail: "Angebote, Leads und regionale Services",
    href: "/business/profile?module=local_services",
    icon: Wrench,
  },
  ai_marketplace: {
    title: "KI-Marktplatz",
    detail: "KI-Produkte, Automatisierungen und Abos",
    href: "/business/profile?module=ai_marketplace",
    icon: Bot,
  },
  eat_restaurant: {
    title: "HotMess Eat",
    detail: "Restaurant, Menue und Bestellungen",
    href: "/business/profile?module=eat_restaurant",
    icon: Utensils,
  },
  event_vendor: {
    title: "Event-Anbieter",
    detail: "Event-Jobs, Vendoren und Personal",
    href: "/business/jobs/manage",
    icon: CalendarDays,
  },
  dating_entrepreneur: {
    title: "Dating Unternehmer",
    detail: "Business-Freigabe fuer Dating-nahe Angebote",
    href: "/dating/profile",
    icon: HeartHandshake,
  },
};

const moduleOrder: BusinessModuleKey[] = [
  "business",
  "creator_business",
  "local_services",
  "ai_marketplace",
  "eat_restaurant",
  "event_vendor",
  "dating_entrepreneur",
];

export function BusinessModuleLinks({ modules, businessEnabled }: { modules: BusinessModuleState[]; businessEnabled: boolean }) {
  const activeKeys = new Set(modules.filter((module) => module.is_active).map((module) => module.module_key));
  const visibleModules = moduleOrder.filter((key) => activeKeys.has(key));

  if (!businessEnabled) {
    return (
      <div className="rounded-xl border border-hm-business/20 bg-hm-business/5 px-3 py-3 text-sm text-hm-inkSoft">
        Aktiviere zuerst HotMess Business, dann erscheinen hier deine freigegebenen Zusatzmodule.
      </div>
    );
  }

  if (!visibleModules.length) {
    return (
      <div className="rounded-xl border border-hm-gold/20 bg-hm-ivory px-3 py-3 text-sm text-hm-inkSoft">
        Noch keine Zusatzmodule freigeschaltet. Sobald dein Unternehmerprofil geprueft ist, erscheinen sie hier.
      </div>
    );
  }

  return (
    <>
      {visibleModules.map((key) => {
        const config = moduleConfig[key];
        const Icon = config.icon;

        return (
          <Link key={key} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-hm-champagne/45" href={config.href}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-business/10 text-hm-business">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-hm-ink">{config.title}</span>
              <span className="block truncate text-xs text-hm-inkSoft">{config.detail}</span>
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              Aktiv
            </span>
          </Link>
        );
      })}
    </>
  );
}
