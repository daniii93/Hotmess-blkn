"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FollowButtonProps = {
  userId: string;
  initialState: "none" | "requested" | "following" | "friends" | "blocked" | "blocked_by";
};

const labels: Record<FollowButtonProps["initialState"], string> = {
  none: "Folgen",
  requested: "Angefragt",
  following: "Abonniert",
  friends: "Freunde",
  blocked: "Blockiert",
  blocked_by: "Nicht verfuegbar",
};

export function FollowButton({ userId, initialState }: FollowButtonProps) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (state === "blocked" || state === "blocked_by") return;
    setBusy(true);
    const action = state === "requested" ? "cancel" : state === "following" || state === "friends" ? "unfollow" : "follow";
    const response = await fetch("/api/profile/follow", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    const payload = (await response.json().catch(() => null)) as { state?: typeof state } | null;
    if (response.ok && payload?.state) setState(payload.state);
    setBusy(false);
    router.refresh();
  };

  return (
    <button
      className="rounded-xl bg-hm-ink px-5 py-2.5 text-sm font-semibold text-hm-porcelain transition hover:bg-hm-gold disabled:opacity-60"
      type="button"
      disabled={busy || state === "blocked" || state === "blocked_by"}
      onClick={handleClick}
    >
      {busy ? "Bitte warten..." : labels[state]}
    </button>
  );
}
