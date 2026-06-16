import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const conversationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(20),
  message: z.string().trim().min(1).max(1000).optional(),
  name: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = conversationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Chat ungueltig." }, { status: 400 });

  const userIds = [...new Set(parsed.data.userIds)].filter((id) => id !== profile.id);
  if (userIds.length === 0) return NextResponse.json({ error: "Waehle mindestens eine Person." }, { status: 400 });

  const supabase = createSupabaseAdminClient();

  if (userIds.length === 1) {
    const targetUserId = userIds[0];
    const [{ data: followsTarget }, { data: targetFollows }] = await Promise.all([
      supabase.from("follows").select("follower_id").eq("follower_id", profile.id).eq("following_id", targetUserId).maybeSingle(),
      supabase.from("follows").select("follower_id").eq("follower_id", targetUserId).eq("following_id", profile.id).maybeSingle(),
    ]);
    const isFriend = Boolean(followsTarget && targetFollows);
    const { data: conversationId, error: directError } = await supabase.rpc("create_direct_conversation", {
      p_user_a: profile.id,
      p_user_b: targetUserId,
    });

    if (directError) return NextResponse.json({ error: directError.message }, { status: 400 });

    if (parsed.data.message) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        type: "text",
        content: parsed.data.message,
        body: parsed.data.message,
      });
    }

    if (!isFriend) {
      await supabase.from("message_requests").insert({
        conversation_id: conversationId,
        requester_id: profile.id,
        target_id: targetUserId,
        from_user_id: profile.id,
        to_user_id: targetUserId,
        first_message: parsed.data.message || "Neue Chat-Anfrage",
        status: "pending",
      });
    }

    return NextResponse.json({ ok: true, conversationId });
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ type: "group", created_by: profile.id, name: parsed.data.name || "Neue Gruppe", last_message_at: new Date().toISOString() })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("conversation_members").insert([profile.id, ...userIds].map((userId) => ({ conversation_id: conversation.id, user_id: userId })));

  if (parsed.data.message) {
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: profile.id,
      type: "text",
      content: parsed.data.message,
      body: parsed.data.message,
    });
  }

  return NextResponse.json({ ok: true, conversationId: conversation.id });
}
