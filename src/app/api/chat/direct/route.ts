import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const directSchema = z.object({
  userId: z.string().uuid(),
  message: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = directSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Chat ungueltig." }, { status: 400 });
  if (parsed.data.userId === profile.id) return NextResponse.json({ error: "Du kannst dich nicht selbst anschreiben." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: conversationId, error } = await supabase.rpc("create_direct_conversation", {
    p_user_a: profile.id,
    p_user_b: parsed.data.userId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (parsed.data.message?.trim()) {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: profile.id,
      type: "text",
      content: parsed.data.message.trim(),
      body: parsed.data.message.trim(),
    });

    await supabase.from("notifications").insert({
      user_id: parsed.data.userId,
      actor_id: profile.id,
      type: "chat_message",
      category: "chat",
      title: "Neue Nachricht",
      body: parsed.data.message.trim(),
      reference_id: conversationId,
      reference_type: "conversation",
    });
  }

  return NextResponse.json({ ok: true, conversationId });
}
