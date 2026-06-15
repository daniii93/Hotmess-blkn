export function ProfileTabs() {
  return (
    <div className="mt-6 flex gap-2 overflow-x-auto border-b border-hm-border pb-3">
      {["Beitraege", "Events", "Badges"].map((tab) => (
        <button key={tab} className="rounded-pill border border-hm-border bg-hm-porcelain px-4 py-2 text-sm font-medium text-hm-ink">
          {tab}
        </button>
      ))}
    </div>
  );
}
