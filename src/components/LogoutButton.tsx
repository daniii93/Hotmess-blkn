"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  className?: string;
  compact?: boolean;
};

export function LogoutButton({ className, compact = false }: LogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const runLogout = async () => {
    setPending(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut().catch(() => null);
    window.location.href = "/logout";
  };

  return (
    <>
      <button
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-500 transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400",
          compact && "rounded-pill px-4",
          className,
        )}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-red-500/10 text-red-500">
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>Abmelden</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-hm-ink/70 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="w-full max-w-sm rounded-card border border-hm-gold/20 bg-[#1C1915] p-5 shadow-luxury">
            <h2 id="logout-title" className="hm-display text-2xl text-hm-porcelain">
              Abmelden
            </h2>
            <p className="mt-3 text-sm leading-6 text-hm-champagne">
              Moechtest du dich wirklich abmelden?
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="rounded-pill border border-hm-porcelain/15 px-4 py-3 text-sm font-bold text-hm-champagne transition hover:bg-hm-porcelain/10"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Abbrechen
              </button>
              <button
                className="w-full rounded-pill bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 disabled:cursor-wait disabled:opacity-60"
                disabled={pending}
                type="button"
                onClick={runLogout}
              >
                {pending ? "Abmeldung laeuft ..." : "Abmelden"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
