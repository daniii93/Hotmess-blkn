"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminModerationItem } from "@/features/admin/live-service";

type ModerationAction = {
  label: string;
  status: "actioned" | "dismissed";
  actionTaken: "removed" | "warned" | "banned" | "none";
  reason: string;
  className: string;
};

const actions: ModerationAction[] = [
  { label: "Entfernen", status: "actioned", actionTaken: "removed", reason: "Inhalt im Admin entfernt", className: "border-red-300 text-red-700" },
  { label: "Verwarnen", status: "actioned", actionTaken: "warned", reason: "Nutzer im Admin verwarnt", className: "border-orange-300 text-orange-700" },
  { label: "Sperren", status: "actioned", actionTaken: "banned", reason: "Nutzer im Admin gesperrt", className: "border-hm-admin/40 text-hm-admin" },
  { label: "Verwerfen", status: "dismissed", actionTaken: "none", reason: "Meldung im Admin verworfen", className: "border-hm-border text-hm-inkSoft" },
];

export function AdminModerationActions({ item }: { item: AdminModerationItem }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const run = async (action: ModerationAction) => {
    setPending(action.label);
    setMessage(null);
    setIsError(false);
    const response = await fetch(`/api/admin/moderation/${item.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: action.status,
        actionTaken: action.actionTaken,
        reason: action.reason,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setPending(null);
    if (!response.ok || payload?.error) {
      setIsError(true);
      setMessage(payload?.error ?? "Moderationsaktion fehlgeschlagen.");
      return;
    }
    setMessage("Moderation aktualisiert.");
    router.refresh();
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            className={`rounded-pill border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${action.className}`}
            disabled={pending !== null}
            key={action.label}
            onClick={() => void run(action)}
            type="button"
          >
            {pending === action.label ? "..." : action.label}
          </button>
        ))}
      </div>
      {message ? <p className={`text-xs ${isError ? "text-red-700" : "text-green-700"}`}>{message}</p> : null}
    </div>
  );
}
