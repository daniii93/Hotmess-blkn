import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const conversationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(249),
  message: z.string().trim().min(1).max(1000).optional(),
  name: z.string().trim().max(80).optional(),
});

const verifyGroupTargets = async (supabase: ReturnType<typeof createSupabaseAdminClient>, currentUserId: string, userIds: string[]) => {
  const [{ data: blockedRows }, { data: profiles }, { data: followerRows }] = await Promise.all([
    supabase
      .from("blocks")
      .select("blocker_id,blocked_id")
      .or(
        userIds
          .map((id) => `and(blocker_id.eq.${currentUserId},blocked_id.eq.${id}),and(blocker_id.eq.${id},blocked_id.eq.${currentUserId})`)
          .join(","),
      ),
    supabase.from("profiles").select("id,first_name,last_name,username,who_can_add_to_groups,is_banned").in("id", userIds),
    supabase.from("follows").select("follower_id,following_id").in("follower_id", userIds).eq("following_id", currentUserId),
  ]);

  if ((blockedRows ?? []).length > 0) return { ok: false, error: "Blockierte Konten koennen nicht zur Gruppe hinzugefuegt werden." };

  const followers = new Set((followerRows ?? []).map((row) => row.follower_id));
  for (const target of profiles ?? []) {
    if (target.is_banned) return { ok: false, error: "Ein ausgewaehltes Konto ist nicht verfuegbar." };
    if ((target as any).who_can_add_to_groups === "followers" && !followers.has(target.id)) {
      const name = `${target.first_name ?? ""} ${target.last_name ?? ""}`.trim() || target.username;
      return { ok: false, error: `${name} erlaubt Gruppen-Einladungen nur von Followern.` };
    }
  }

  return { ok: true, error: null };
};

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = conversationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Chat ungueltig." }, { status: 400 });

  const userIds = [...new Set(parsed.data.userIds)].filter((id) => id !== profile.id);
  if (userIds.length === 0) return NextResponse.json({ error: "Waehle mindestens eine Person." }, { status: 400 });
  if (userIds.length + 1 > 250) return NextResponse.json({ error: "Gruppen sind auf 250 Mitglieder begrenzt." }, { status: 400 });

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

  const targetCheck = await verifyGroupTargets(supabase, profile.id, userIds);
  if (!targetCheck.ok) return NextResponse.json({ error: targetCheck.error }, { status: 403 });

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ type: "group", created_by: profile.id, name: parsed.data.name || "Neue Gruppe", last_message_at: new Date().toISOString() })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("conversation_members").insert([
    { conversation_id: conversation.id, user_id: profile.id, role: "admin" },
    ...userIds.map((userId) => ({ conversation_id: conversation.id, user_id: userId, role: "member" })),
  ]);

  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: profile.id,
    type: "system",
    content: "Gruppe erstellt",
    body: "Gruppe erstellt",
  });

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
