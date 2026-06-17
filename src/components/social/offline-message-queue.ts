"use client";

export type QueuedChatMessage = {
  id: string;
  conversationId: string;
  content: string;
  replyToId?: string;
  createdAt: number;
};

const DB_NAME = "hotmess-chat-offline";
const STORE_NAME = "queued_messages";
const DB_VERSION = 1;

function openQueueDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("conversationId", "conversationId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function createQueuedMessage(input: Omit<QueuedChatMessage, "id" | "createdAt">): QueuedChatMessage {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return { ...input, id, createdAt: Date.now() };
}

export async function enqueueChatMessage(message: QueuedChatMessage): Promise<void> {
  const db = await openQueueDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(message);
  await txDone(tx);
  db.close();
}

export async function removeQueuedChatMessage(id: string): Promise<void> {
  const db = await openQueueDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(id);
  await txDone(tx);
  db.close();
}

export async function listQueuedChatMessages(conversationId?: string): Promise<QueuedChatMessage[]> {
  const db = await openQueueDb();

  const messages = await new Promise<QueuedChatMessage[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = conversationId ? store.index("conversationId").getAll(conversationId) : store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as QueuedChatMessage[]).sort((a, b) => a.createdAt - b.createdAt));
  });

  db.close();
  return messages;
}

export async function flushQueuedChatMessages(conversationId?: string): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;

  const queued = await listQueuedChatMessages(conversationId);
  let sent = 0;

  for (const message of queued) {
    const response = await fetch(`/api/chat/${message.conversationId}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: message.content, replyToId: message.replyToId }),
    }).catch(() => null);

    if (!response?.ok) break;
    await removeQueuedChatMessage(message.id);
    sent += 1;
  }

  return sent;
}
