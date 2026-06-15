import type { HTMLAttributes, ReactNode } from "react";

type LuxuryBadgeTone = "gold" | "verified" | "vip" | "soldOut" | "waitlist" | "new" | "limited";

export type LuxuryBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: LuxuryBadgeTone;
};

const toneClasses: Record<LuxuryBadgeTone, string> = {
  gold: "border-hm-borderStrong bg-hm-champagne/10 text-hm-champagne",
  verified: "border-hm-info/25 bg-hm-info/10 text-hm-info",
  vip: "border-hm-champagne/30 bg-hm-champagne/10 text-hm-champagne",
  soldOut: "border-hm-red/25 bg-hm-red/10 text-hm-error",
  waitlist: "border-hm-warning/25 bg-hm-warning/10 text-hm-warning",
  new: "border-hm-success/25 bg-hm-success/10 text-hm-success",
  limited: "border-hm-antiqueGold/30 bg-hm-antiqueGold/10 text-hm-champagne",
};

const cx = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(" ");

export function LuxuryBadge({ children, className, tone = "gold", ...props }: LuxuryBadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center rounded-pill border px-3 text-xs font-semibold uppercase tracking-luxury",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
