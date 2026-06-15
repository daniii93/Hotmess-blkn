"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LikeButton({ postId, initialLiked, initialCount }: { postId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const response = await fetch(`/api/social/posts/${postId}/like`, { method: liked ? "DELETE" : "POST" });
    setLoading(false);
    if (!response.ok) return;
    setLiked((value) => !value);
    setCount((value) => value + (liked ? -1 : 1));
  };

  return (
    <button disabled={loading} onClick={toggle} type="button">
      {liked ? "Gefaellt dir" : "Gefaellt mir"} · {count}
    </button>
  );
}

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/social/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, mediaUrl: mediaUrl || undefined }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setLoading(false);

    if (!response.ok || payload?.error) {
      setMessage(payload?.error ?? "Beitrag konnte nicht erstellt werden.");
      return;
    }

    setContent("");
    setMediaUrl("");
    setMessage("Beitrag erstellt.");
    router.push("/feed");
    router.refresh();
  };

  return (
    <div className="grid gap-4">
      <label className="rounded-card border border-hm-borderSoft bg-hm-ivory p-5">
        <span className="font-semibold text-hm-ink">Caption</span>
        <textarea className="mt-3 min-h-32 w-full rounded-card border border-hm-border bg-hm-porcelain p-4 outline-none focus:border-hm-gold" placeholder="#hashtags und @mentions" value={content} onChange={(event) => setContent(event.target.value)} />
      </label>
      <label className="rounded-card border border-hm-borderSoft bg-hm-ivory p-5">
        <span className="font-semibold text-hm-ink">Media URL</span>
        <input className="mt-3 w-full rounded-pill border border-hm-border bg-hm-porcelain px-4 py-3 outline-none focus:border-hm-gold" placeholder="https://..." value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} />
      </label>
      <button className="w-fit rounded-pill bg-hm-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} onClick={submit} type="button">
        {loading ? "Teile..." : "Teilen"}
      </button>
      {message ? <p className="rounded-card bg-hm-champagne px-4 py-3 text-sm text-hm-ink">{message}</p> : null}
    </div>
  );
}

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const send = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const response = await fetch(`/api/chat/${conversationId}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setLoading(false);
    if (!response.ok) return;
    setContent("");
    router.refresh();
  };

  return (
    <div className="flex gap-2 rounded-card border border-hm-border bg-hm-porcelain p-3">
      <input className="min-w-0 flex-1 bg-transparent px-2 outline-none" placeholder="Chat schreiben" value={content} onChange={(event) => setContent(event.target.value)} />
      <button className="rounded-pill bg-hm-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={loading || !content.trim()} onClick={send} type="button">
        Senden
      </button>
    </div>
  );
}
