"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MessageComposer } from "@/components/social/social-actions";

type PresencePayload = {
  userId: string;
  typing: boolean;
  at: number;
};

export function TypingAwareComposer({ conversationId }: { conversationId: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [typingCount, setTypingCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscribedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (mounted) setCurrentUserId(data.user?.id ?? null);
    });

    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase.channel(`conversation:${conversationId}:typing`, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresencePayload>();
        const now = Date.now();
        const active = Object.values(state)
          .flat()
          .filter((entry) => entry.userId !== currentUserId && entry.typing && now - entry.at < 5000);
        setTypingCount(active.length);
      })
      .subscribe((status) => {
        subscribedRef.current = status === "SUBSCRIBED";
      });

    channelRef.current = channel;

    return () => {
      subscribedRef.current = false;
      channelRef.current = null;
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, supabase]);

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!currentUserId || !channelRef.current || !subscribedRef.current) return;

      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

      if (!isTyping) {
        void channelRef.current.untrack();
        return;
      }

      void channelRef.current.track({ userId: currentUserId, typing: true, at: Date.now() } satisfies PresencePayload);
      clearTimerRef.current = setTimeout(() => {
        void channelRef.current?.untrack();
      }, 1800);
    },
    [currentUserId],
  );

  const typingLabel = typingCount === 1 ? "Jemand tippt ..." : `${typingCount} Personen tippen ...`;

  return (
    <div className="space-y-2">
      {typingCount > 0 ? (
        <p className="px-3 text-xs font-semibold text-hm-goldDeep" aria-live="polite">
          {typingLabel}
        </p>
      ) : null}
      <MessageComposer conversationId={conversationId} onTyping={setTyping} />
    </div>
  );
}
