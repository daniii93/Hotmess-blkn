"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createQueuedMessage,
  enqueueChatMessage,
  flushQueuedChatMessages,
  listQueuedChatMessages,
} from "@/components/social/offline-message-queue";

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

export function MessageComposer({ conversationId, replyToId, onTyping }: { conversationId: string; replyToId?: string; onTyping?: (typing: boolean) => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const router = useRouter();

  const refreshQueueCount = useCallback(async () => {
    const queued = await listQueuedChatMessages(conversationId).catch(() => []);
    setQueuedCount(queued.length);
  }, [conversationId]);

  const flushQueue = useCallback(async () => {
    const sent = await flushQueuedChatMessages(conversationId).catch(() => 0);
    await refreshQueueCount();
    if (sent > 0) {
      setNotice(`${sent} Offline-Nachricht${sent === 1 ? "" : "en"} gesendet.`);
      router.refresh();
    }
  }, [conversationId, refreshQueueCount, router]);

  useEffect(() => {
    void refreshQueueCount();
    void flushQueue();

    const onOnline = () => void flushQueue();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushQueue, refreshQueueCount]);

  const queueMessage = useCallback(
    async (text: string) => {
      await enqueueChatMessage(createQueuedMessage({ conversationId, content: text, replyToId }));
      await refreshQueueCount();
      setNotice("Offline gespeichert. Wird gesendet, sobald du wieder online bist.");
    },
    [conversationId, refreshQueueCount, replyToId],
  );

  const send = async () => {
    const text = content.trim();
    if (!text) return;
    onTyping?.(false);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await queueMessage(text);
      setContent("");
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/chat/${conversationId}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: text, replyToId }),
    }).catch(() => null);
    setLoading(false);

    if (!response?.ok) {
      await queueMessage(text);
      setContent("");
      return;
    }

    setContent("");
    setNotice(null);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 rounded-card border border-hm-border bg-hm-porcelain p-3">
        <input
          className="min-w-0 flex-1 bg-transparent px-2 outline-none"
          placeholder="Chat schreiben"
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            onTyping?.(event.target.value.trim().length > 0);
          }}
          onBlur={() => onTyping?.(false)}
        />
        <button className="rounded-pill bg-hm-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={loading || !content.trim()} onClick={send} type="button">
          {loading ? "Sendet..." : "Senden"}
        </button>
      </div>
      {notice || queuedCount > 0 ? (
        <p className="rounded-2xl bg-hm-champagne px-3 py-2 text-xs font-semibold text-hm-ink" aria-live="polite">
          {notice ?? `${queuedCount} Nachricht${queuedCount === 1 ? "" : "en"} wartet offline.`}
        </p>
      ) : null}
    </div>
  );
}

export function ChatMessageActions({ messageId, mine, content }: { messageId: string; mine: boolean; content: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const run = async (body: Record<string, unknown>, label: string) => {
    setLoading(label);
    await fetch(`/api/chat/messages/${messageId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    setLoading(null);
    router.refresh();
  };

  const react = () => {
    const emoji = window.prompt("Emoji-Reaktion", "❤️");
    if (emoji) void run({ action: "react", emoji }, "react");
  };

  const reply = () => {
    const text = window.prompt("Antwort schreiben");
    if (text) {
      const conversationId = window.location.pathname.split("/").pop();
      if (!conversationId) return;
      setLoading("reply");
      fetch(`/api/chat/${conversationId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: text, replyToId: messageId }),
      }).finally(() => {
        setLoading(null);
        router.refresh();
      });
    }
  };

  const edit = () => {
    const text = window.prompt("Nachricht bearbeiten", content ?? "");
    if (text) void run({ action: "edit", content: text }, "edit");
  };

  const forward = () => {
    const ids = window.prompt("Bis zu 5 Chat-IDs, mit Komma getrennt");
    const conversationIds = ids?.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 5) ?? [];
    if (conversationIds.length) void run({ action: "forward", conversationIds }, "forward");
  };

  const copy = async () => {
    if (content) await navigator.clipboard?.writeText(content).catch(() => null);
  };

  const recall = () => {
    if (window.confirm("Nachricht fuer alle zurueckrufen? Empfaenger koennen sie bereits gesehen haben.")) {
      void run({ action: "unsend" }, "unsend");
    }
  };

  const report = () => {
    if (window.confirm("Diese Nachricht an HotMess Moderation melden?")) {
      void run({ action: "report", reason: "chat_message_report" }, "report");
    }
  };

  return (
    <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
      <button className="rounded-pill bg-white/70 px-2 py-1 font-bold text-hm-ink" disabled={Boolean(loading)} onClick={react} type="button">Reagieren</button>
      <button className="rounded-pill bg-white/70 px-2 py-1 font-bold text-hm-ink" disabled={Boolean(loading)} onClick={reply} type="button">Antworten</button>
      <button className="rounded-pill bg-white/70 px-2 py-1 font-bold text-hm-ink" disabled={Boolean(loading)} onClick={forward} type="button">Weiterleiten</button>
      {content ? <button className="rounded-pill bg-white/70 px-2 py-1 font-bold text-hm-ink" onClick={() => void copy()} type="button">Kopieren</button> : null}
      <button className="rounded-pill bg-white/70 px-2 py-1 font-bold text-hm-ink" disabled={Boolean(loading)} onClick={() => void run({ action: "pin" }, "pin")} type="button">Pinnen</button>
      {mine ? <button className="rounded-pill bg-white/70 px-2 py-1 font-bold text-hm-ink" disabled={Boolean(loading)} onClick={edit} type="button">Bearbeiten</button> : null}
      {mine ? <button className="rounded-pill bg-red-50 px-2 py-1 font-bold text-[#9C4A3C]" disabled={Boolean(loading)} onClick={recall} type="button">Zurueckrufen</button> : null}
      <button className="rounded-pill bg-red-50 px-2 py-1 font-bold text-[#9C4A3C]" disabled={Boolean(loading)} onClick={report} type="button">Melden</button>
    </div>
  );
}
