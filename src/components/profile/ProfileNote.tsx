export function ProfileNote({ isOwnProfile }: { isOwnProfile: boolean }) {
  return (
    <button
      className="absolute -top-8 left-1/2 max-w-32 -translate-x-1/2 rounded-[18px] border border-hm-gold/25 bg-hm-porcelain px-3 py-1.5 text-xs text-hm-inkSoft shadow-soft"
      type="button"
      aria-label={isOwnProfile ? "Profilnotiz bearbeiten" : "Profilnotiz ansehen"}
    >
      Faszin. von HotMess
    </button>
  );
}
