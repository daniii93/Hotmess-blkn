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
  const [blockedResult, profilesResult, followerResult] = await Promise.all([
    supabase
      .from("blocks")
      .select("blocker_id,blocked_id")
      .or(
        userIds
          .map((id) => `and(blocker_id.eq.${currentUserId},blocked_id.eq.${id}),and(blocker_id.eq.${id},blocked_id.eq.${currentUserId})`)
          .join(","),
      ),
    supabase.from("profiles").select("id,first_name,last_name,username,who_can_add_to_groups,is_banned,verification_status").in("id", userIds),
    supabase.from("follows").select("follower_id,following_id").in("follower_id", userIds).eq("following_id", currentUserId),
  ]);

  const blockedRows = blockedResult.data;
  const profiles = profilesResult.error && /who_can_add_to_groups|does not exist|schema cache|42703/i.test(profilesResult.error.message) ? [] : profilesResult.data;
  const followerRows = followerResult.data;

  if ((blockedRows ?? []).length > 0) return { ok: false, error: "Blockierte Konten koennen nicht zur Gruppe hinzugefuegt werden." };

  const followers = new Set((followerRows ?? []).map((row) => row.follower_id));
  for (const target of profiles ?? []) {
    if (target.is_banned) return { ok: false, error: "Ein ausgewaehltes Konto ist nicht verfuegbar." };
    if (target.verification_status !== "verified") return { ok: false, error: "Gruppen sind nur mit verifizierten Nutzern moeglich." };
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
    const [{ data: followsTarget }, { data: targetFollows }, { data: block }, { data: targetProfile }] = await Promise.all([
      supabase.from("follows").select("follower_id").eq("follower_id", profile.id).eq("following_id", targetUserId).maybeSingle(),
      supabase.from("follows").select("follower_id").eq("follower_id", targetUserId).eq("following_id", profile.id).maybeSingle(),
      supabase
        .from("blocks")
        .select("blocker_id")
        .or(`and(blocker_id.eq.${profile.id},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${profile.id})`)
        .maybeSingle(),
      supabase.from("profiles").select("id,is_banned,verification_status,who_can_message").eq("id", targetUserId).maybeSingle(),
    ]);

    if (block) return NextResponse.json({ error: "Dieser Chat ist wegen einer Blockierung nicht moeglich." }, { status: 403 });
    if (!targetProfile || targetProfile.is_banned || targetProfile.verification_status !== "verified") {
      return NextResponse.json({ error: "Dieses Konto ist nicht verfuegbar." }, { status: 404 });
    }
    if (targetProfile.who_can_message === "off") return NextResponse.json({ error: "Diese Person nimmt aktuell keine neuen Nachrichtenanfragen an." }, { status: 403 });
    if (targetProfile.who_can_message === "followers" && !targetFollows) {
      return NextResponse.json({ error: "Diese Person erlaubt Nachrichten nur von Personen, denen sie folgt." }, { status: 403 });
    }

    const isFriend = Boolean(followsTarget && targetFollows);
    const { data: conversationId, error: directError } = await supabase.rpc("create_direct_conversation", {
      p_user_a: profile.id,
      p_user_b: targetUserId,
    });

    if (directError) return NextResponse.json({ error: directError.message }, { status: 400 });

    if (parsed.data.message) {
      const insertDirect = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        type: "text",
        content: parsed.data.message,
        body: parsed.data.message,
      });
      if (insertDirect.error && /content|does not exist|schema cache|42703/i.test(insertDirect.error.message)) {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          type: "text",
          body: parsed.data.message,
        });
      }
    }

    if (!isFriend) {
      const { data: existingRequest, error: existingRequestError } = await supabase
        .from("message_requests")
        .select("id")
        .eq("from_user_id", profile.id)
        .eq("to_user_id", targetUserId)
        .maybeSingle();

      if (existingRequestError) return NextResponse.json({ error: existingRequestError.message }, { status: 400 });

      if (existingRequest) {
        const { error: requestUpdateError } = await supabase
          .from("message_requests")
          .update({
            conversation_id: conversationId,
            first_message: parsed.data.message || "Neue Chat-Anfrage",
            status: "pending",
          })
          .eq("id", existingRequest.id);
        if (requestUpdateError) return NextResponse.json({ error: requestUpdateError.message }, { status: 400 });
      } else {
        const { error: requestInsertError } = await supabase.from("message_requests").insert({
          conversation_id: conversationId,
          requester_id: profile.id,
          target_id: targetUserId,
          from_user_id: profile.id,
          to_user_id: targetUserId,
          first_message: parsed.data.message || "Neue Chat-Anfrage",
          status: "pending",
        });
        if (requestInsertError) return NextResponse.json({ error: requestInsertError.message }, { status: 400 });
      }
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

  const { error: memberError } = await supabase.from("conversation_members").insert([
    { conversation_id: conversation.id, user_id: profile.id, role: "admin" },
    ...userIds.map((userId) => ({ conversation_id: conversation.id, user_id: userId, role: "member" })),
  ]);
  if (memberError && /role|does not exist|schema cache|42703/i.test(memberError.message)) {
    await supabase.from("conversation_members").insert([profile.id, ...userIds].map((userId) => ({ conversation_id: conversation.id, user_id: userId })));
  } else if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 400 });
  }

  const systemInsert = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: profile.id,
    type: "system",
    content: "Gruppe erstellt",
    body: "Gruppe erstellt",
  });
  if (systemInsert.error) {
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: profile.id,
      type: "text",
      body: "Gruppe erstellt",
    });
  }

  if (parsed.data.message) {
    const insertMessage = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: profile.id,
      type: "text",
      content: parsed.data.message,
      body: parsed.data.message,
    });
    if (insertMessage.error && /content|does not exist|schema cache|42703/i.test(insertMessage.error.message)) {
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: profile.id,
        type: "text",
        body: parsed.data.message,
      });
    }
  }

  return NextResponse.json({ ok: true, conversationId: conversation.id });
}
