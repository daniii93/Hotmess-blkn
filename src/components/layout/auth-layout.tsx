import type { ReactNode } from "react";

export type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-hm-pearl px-4 py-10 text-hm-textDark">
      <section className="w-full max-w-md rounded-card border border-hm-border bg-white/80 p-6 shadow-luxury backdrop-blur-xl">
        {children}
      </section>
    </main>
  );
}

