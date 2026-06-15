type OnboardingWizardProps = {
  step: number;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function OnboardingWizard({ step, title, description, children }: OnboardingWizardProps) {
  const progress = Math.max(1, Math.min(step, 9)) / 9 * 100;

  return (
    <section className="mx-auto w-full max-w-3xl rounded-card border border-hm-border bg-hm-porcelain p-6 shadow-luxury">
      <div className="mb-6 h-2 overflow-hidden rounded-pill bg-hm-champagne">
        <div className="h-full rounded-pill bg-hm-gold" style={{ width: `${progress}%` }} />
      </div>
      <p className="hm-label">Schritt {step} von 9</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">{title}</h1>
      <p className="mt-4 text-hm-inkSoft">{description}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}
