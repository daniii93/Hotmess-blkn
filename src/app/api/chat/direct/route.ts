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
  const [{ data: followsTarget }, { data: targetFollows }, { data: block }, { data: targetSettings }] = await Promise.all([
    supabase.from("follows").select("follower_id").eq("follower_id", profile.id).eq("following_id", parsed.data.userId).maybeSingle(),
    supabase.from("follows").select("follower_id").eq("follower_id", parsed.data.userId).eq("following_id", profile.id).maybeSingle(),
    supabase
      .from("blocks")
      .select("blocker_id")
      .or(`and(blocker_id.eq.${profile.id},blocked_id.eq.${parsed.data.userId}),and(blocker_id.eq.${parsed.data.userId},blocked_id.eq.${profile.id})`)
      .maybeSingle(),
    supabase.from("profiles").select("who_can_message").eq("id", parsed.data.userId).maybeSingle(),
  ]);

  if (block) return NextResponse.json({ error: "Dieser Chat ist wegen einer Blockierung nicht moeglich." }, { status: 403 });
  if (targetSettings?.who_can_message === "off") return NextResponse.json({ error: "Diese Person nimmt aktuell keine neuen Nachrichtenanfragen an." }, { status: 403 });
  if (targetSettings?.who_can_message === "followers" && !targetFollows) {
    return NextResponse.json({ error: "Diese Person erlaubt Nachrichten nur von Personen, denen sie folgt." }, { status: 403 });
  }

  const isFriend = Boolean(followsTarget && targetFollows);

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
      type: isFriend ? "chat_message" : "chat_request",
      category: "chat",
      title: isFriend ? "Neue Nachricht" : "Neue Chat-Anfrage",
      body: parsed.data.message.trim(),
      reference_id: conversationId,
      reference_type: "conversation",
    });
  }

  if (!isFriend) {
    const { data: existingRequest } = await supabase
      .from("message_requests")
      .select("id")
      .eq("from_user_id", profile.id)
      .eq("to_user_id", parsed.data.userId)
      .maybeSingle();

    if (existingRequest) {
      await supabase
        .from("message_requests")
        .update({
          conversation_id: conversationId,
          first_message: parsed.data.message?.trim() || "Neue Chat-Anfrage",
          status: "pending",
        })
        .eq("id", existingRequest.id);
    } else {
      await supabase.from("message_requests").insert({
        conversation_id: conversationId,
        requester_id: profile.id,
        target_id: parsed.data.userId,
        from_user_id: profile.id,
        to_user_id: parsed.data.userId,
        first_message: parsed.data.message?.trim() || "Neue Chat-Anfrage",
        status: "pending",
      });
    }
  }

  return NextResponse.json({ ok: true, conversationId });
}
