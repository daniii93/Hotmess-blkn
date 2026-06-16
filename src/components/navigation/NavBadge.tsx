import { cn } from "@/lib/utils/cn";

export function NavBadge({ count, dot, className }: { count?: number; dot?: boolean; className?: string }) {
  if (!dot && !count) return null;
  const display = count ? (count > 9 ? "9+" : String(count)) : "";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute -right-1 -top-1 flex min-h-[11px] min-w-[11px] items-center justify-center rounded-full border-2 border-hm-ivory bg-[#9C4A3C] text-[10px] font-semibold leading-none text-white",
        count ? "h-5 min-w-5 px-1" : "h-3 w-3",
        className,
      )}
    >
      {display}
    </span>
  );
}

