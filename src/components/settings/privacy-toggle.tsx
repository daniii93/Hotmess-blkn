type PrivacyToggleProps = {
  label: string;
  enabled?: boolean;
};

export function PrivacyToggle({ label, enabled = true }: PrivacyToggleProps) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-card border border-hm-border bg-hm-porcelain p-4 text-sm text-hm-ink">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={enabled} className="h-5 w-5 accent-hm-gold" />
    </label>
  );
}
