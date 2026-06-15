import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const messageSchema = z.object({
  content: z.string().min(1).max(4000),
  type: z.enum(["text", "event_card", "system"]).default("text"),
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

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: id,
      sender_id: profile.id,
      type: parsed.data.type,
      content: parsed.data.content,
      body: parsed.data.content,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

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
