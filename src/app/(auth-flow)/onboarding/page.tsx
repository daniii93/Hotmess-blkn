import { OnboardingWizard } from "@/components/auth/onboarding-wizard";
import { getTranslations } from "next-intl/server";

const steps = [
  "language",
  "identity",
  "username",
  "photo",
  "interests",
  "notifications",
  "friends",
  "firstEvent",
  "done",
] as const;

export default async function OnboardingPage() {
  const t = await getTranslations();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <OnboardingWizard step={1} title={t("pages.onboarding.title")} description={t("pages.onboarding.description")}>
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="rounded-card border border-hm-border bg-hm-ivory p-4 text-sm text-hm-inkSoft">
              {index + 1}. {t(`onboarding.${step}`)}
            </div>
          ))}
        </div>
      </OnboardingWizard>
    </main>
  );
}
