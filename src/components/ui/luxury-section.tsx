import type { HTMLAttributes, ReactNode } from "react";

export type LuxurySectionProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
};

const cx = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(" ");

export function LuxurySection({ eyebrow, title, description, children, className, ...props }: LuxurySectionProps) {
  return (
    <section className={cx("mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8", className)} {...props}>
      {(eyebrow || title || description) && (
        <header className="mb-10 max-w-3xl">
          {eyebrow ? <p className="mb-3 text-xs font-bold uppercase tracking-luxury text-hm-champagne">{eyebrow}</p> : null}
          {title ? <h2 className="font-display text-4xl leading-none text-hm-textPrimary md:text-6xl">{title}</h2> : null}
          {description ? <p className="mt-5 text-base leading-7 text-hm-textSecondary md:text-lg">{description}</p> : null}
        </header>
      )}
      {children}
    </section>
  );
}

