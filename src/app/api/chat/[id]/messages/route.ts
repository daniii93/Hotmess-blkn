import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const messageSchema = z.object({
  content: z.string().min(1).max(4000),
  type: z.enum(["text", "image", "video", "voice", "gif", "event_card", "poll", "location", "system"]).default("text"),
  mediaUrl: z.string().url().optional(),
  eventId: z.string().uuid().optional(),
  replyToId: z.string().uuid().optional(),
  mode: z.enum(["standard", "vanish", "snap"]).default("standard"),
  transcript: z.string().max(4000).optional(),
});

type MessageParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: MessageParams) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nachricht ungueltig." }, { status: 400 });

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: member } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", id)
    .eq("user_id", profile.id)
    .is("left_at", null)
    .maybeSingle();

  if (!member && profile.role !== "admin") return NextResponse.json({ error: "Kein Zugriff auf diesen Chat." }, { status: 403 });

  const { data: pendingRequest } = await supabase
    .from("message_requests")
    .select("id,status")
    .eq("conversation_id", id)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingRequest && parsed.data.type !== "text") {
    return NextResponse.json({ error: "Chat-Anfragen sind bis zur Annahme text-only." }, { status: 403 });
  }

  if (pendingRequest && parsed.data.mode !== "standard") {
    return NextResponse.json({ error: "Selbstloeschende Nachrichten sind erst nach Annahme der Anfrage moeglich." }, { status: 403 });
  }

  let { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: id,
      sender_id: profile.id,
      type: parsed.data.type,
      content: parsed.data.content,
      body: parsed.data.content,
      media_url: parsed.data.mediaUrl,
      event_id: parsed.data.eventId,
      reply_to_id: parsed.data.replyToId,
      mode: parsed.data.mode,
      transcript: parsed.data.transcript,
      expires_at: parsed.data.mode === "vanish" ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
    })
    .select("id")
    .single();

  if (error && /does not exist|could not find|schema cache|42703/i.test(error.message)) {
    const legacy = await supabase
      .from("messages")
      .insert({
        conversation_id: id,
        sender_id: profile.id,
        type: parsed.data.type,
        body: parsed.data.content,
        media_url: parsed.data.mediaUrl,
        reply_to_id: parsed.data.replyToId,
      })
      .select("id")
      .single();
    message = legacy.data;
    error = legacy.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Nachricht konnte nicht gespeichert werden." }, { status: 400 });

  const { data: members } = await supabase.from("conversation_members").select("user_id").eq("conversation_id", id).neq("user_id", profile.id);
  for (const memberRow of members ?? []) {
    await supabase.from("notifications").insert({
      user_id: memberRow.user_id,
      actor_id: profile.id,
      type: "chat_message",
      category: "chat",
      title: "Neue Nachricht",
      body: parsed.data.content,
      reference_id: id,
      reference_type: "conversation",
    });
  }

  return NextResponse.json({ ok: true, messageId: message.id });
}
