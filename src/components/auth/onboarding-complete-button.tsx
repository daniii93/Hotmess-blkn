"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OnboardingCompleteButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const completeOnboarding = async () => {
    setStatus("loading");
    setMessage(null);

    const response = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "content-type": "application/json" },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(payload?.error ?? "Onboarding konnte nicht abgeschlossen werden.");
      return;
    }

    router.replace("/feed");
    router.refresh();
  };

  return (
    <div className="mt-8 grid gap-3">
      {message ? <p className="rounded-card bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}
      <button
        className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-hm-porcelain transition hover:bg-hm-gold disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        disabled={status === "loading"}
        onClick={completeOnboarding}
      >
        {status === "loading" ? "Wird gespeichert..." : "Onboarding abschliessen"}
      </button>
    </div>
  );
}
