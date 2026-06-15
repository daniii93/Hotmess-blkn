import type { HTMLAttributes, ReactNode } from "react";

export type LuxuryCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "article" | "section" | "div";
  tone?: "dark" | "glass" | "ivory";
};

const toneClasses = {
  dark: "bg-hm-charcoal text-hm-textPrimary border-hm-border",
  glass: "bg-hm-glass text-hm-textPrimary border-hm-glassBorder backdrop-blur-xl",
  ivory: "bg-hm-pearl text-hm-textDark border-hm-border",
} as const;

const cx = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(" ");

export function LuxuryCard({ children, className, as = "article", tone = "glass", ...props }: LuxuryCardProps) {
  const Component = as;

  return (
    <Component
      className={cx(
        "rounded-card border p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-hm-borderStrong",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

