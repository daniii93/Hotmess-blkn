import type { ButtonHTMLAttributes, ReactNode } from "react";

type LuxuryButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
type LuxuryButtonSize = "sm" | "md" | "lg";

export type LuxuryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: LuxuryButtonVariant;
  size?: LuxuryButtonSize;
};

const variantClasses: Record<LuxuryButtonVariant, string> = {
  primary: "bg-hm-champagne text-hm-textDark border-hm-champagne hover:bg-hm-gold",
  secondary: "bg-transparent text-hm-champagne border-hm-borderStrong hover:bg-hm-champagne/10",
  destructive: "bg-hm-red/10 text-hm-red border-hm-red/30 hover:bg-hm-red/20",
  ghost: "bg-hm-glass text-hm-textPrimary border-hm-glassBorder hover:border-hm-borderStrong",
};

const sizeClasses: Record<LuxuryButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-7 text-base",
};

const cx = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(" ");

export function LuxuryButton({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: LuxuryButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center rounded-pill border font-semibold tracking-wide transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hm-champagne disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
