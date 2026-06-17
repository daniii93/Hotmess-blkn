"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminUserRowLive } from "@/features/admin/live-service";

type ActionStatus = "idle" | "loading" | "success" | "error";

export function AdminUserActions({ user }: { user: AdminUserRowLive }) {
  const router = useRouter();
  const [status, setStatus] = useState<ActionStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const run = async (url: string, body: Record<string, unknown>, success: string) => {
    setStatus("loading");
    setMessage(null);
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok || payload?.error) {
      setStatus("error");
      setMessage(payload?.error ?? "Admin-Aktion fehlgeschlagen.");
      return;
    }
    setStatus("success");
    setMessage(success);
    router.refresh();
  };

  const changeRole = (role: string) =>
    run(`/api/admin/users/${user.id}/role`, { role, reason: `Rolle im Admin auf ${role} gesetzt` }, "Rolle aktualisiert.");

  const sanction = (type: "warning" | "temp_ban" | "perm_ban" | "feature_block") =>
    run(
      `/api/admin/users/${user.id}/sanction`,
      {
        type,
        scope: type === "feature_block" ? "posting" : "all",
        reason: type === "warning" ? "Admin-Warnung" : type === "feature_block" ? "Feature im Admin blockiert" : "Admin-Sperre",
        expiresAt: type === "temp_ban" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      },
      "Sanktion gespeichert.",
    );

  return (
    <div className="min-w-[280px] space-y-2">
      <div className="flex flex-wrap gap-2">
        <select
          aria-label={`Rolle fuer ${user.name} aendern`}
          className="rounded-pill border border-hm-admin/40 bg-hm-porcelain px-3 py-1 text-xs text-hm-ink outline-none focus:border-hm-admin"
          defaultValue={user.role}
          disabled={status === "loading"}
          onChange={(event) => void changeRole(event.target.value)}
        >
          <option value="user">Nutzer</option>
          <option value="scanner">Scanner</option>
          <option value="admin">Admin</option>
        </select>
        <button className="rounded-pill border border-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-700 disabled:opacity-50" disabled={status === "loading"} onClick={() => void sanction("warning")} type="button">
          Warnen
        </button>
        <button className="rounded-pill border border-orange-400 px-3 py-1 text-xs font-semibold text-orange-700 disabled:opacity-50" disabled={status === "loading"} onClick={() => void sanction("temp_ban")} type="button">
          7T sperren
        </button>
        <button className="rounded-pill border border-hm-admin/40 px-3 py-1 text-xs font-semibold text-hm-admin disabled:opacity-50" disabled={status === "loading"} onClick={() => void sanction("feature_block")} type="button">
          Posting blockieren
        </button>
      </div>
      {message ? <p className={`text-xs ${status === "error" ? "text-red-700" : "text-green-700"}`}>{message}</p> : null}
    </div>
  );
}
