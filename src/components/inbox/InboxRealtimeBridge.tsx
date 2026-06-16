"use client";

import { useInboxRealtime } from "./useInboxRealtime";

export function InboxRealtimeBridge({ onRefresh }: { onRefresh: () => void }) {
  useInboxRealtime(onRefresh);
  return null;
}
