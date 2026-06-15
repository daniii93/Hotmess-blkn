"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminCancelEventButton({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const cancelEvent = async () => {
    const reason = window.prompt("Grund fuer die Absage", "Event abgesagt");
    if (!reason) return;

    setStatus("loading");
    setMessage(null);
    const response = await fetch(`/api/admin/events/${eventId}/cancel`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string; refunds?: unknown[] } | null;

    if (!response.ok || payload?.error) {
      setStatus("error");
      setMessage(payload?.error ?? "Event konnte nicht abgesagt werden.");
      return;
    }

    setStatus("done");
    setMessage(`Event abgesagt. Refunds: ${payload?.refunds?.length ?? 0}`);
    router.refresh();
  };

  return (
    <div>
      <button className="rounded-pill border border-hm-error px-5 py-3 text-sm font-semibold text-hm-error disabled:opacity-60" disabled={status === "loading"} onClick={cancelEvent} type="button">
        {status === "loading" ? "Sage ab..." : "Event absagen"}
      </button>
      {message ? <p className={`mt-2 text-xs ${status === "error" ? "text-red-700" : "text-green-700"}`}>{message}</p> : null}
    </div>
  );
}
