import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const uuid = z.string().uuid();

const groupActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("rename"), name: z.string().trim().min(1).max(80) }),
  z.object({ action: z.literal("setAvatar"), avatarUrl: z.string().url().nullable() }),
  z.object({ action: z.literal("setNickname"), userId: uuid.optional(), nickname: z.string().trim().max(40).nullable() }),
  z.object({ action: z.literal("addMembers"), userIds: z.array(uuid).min(1).max(249) }),
  z.object({ action: z.literal("removeMember"), userId: uuid }),
  z.object({ action: z.literal("promote"), userId: uuid }),
  z.object({ action: z.literal("demote"), userId: uuid }),
  z.object({ action: z.literal("leave") }),
  z.object({ action: z.literal("mute"), muted: z.boolean() }),
]);

const systemMessage = async (supabase: ReturnType<typeof createSupabaseAdminClient>, conversationId: string, userId: string, content: string) => {
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: userId,
    type: "system",
    content,
    body: content,
  });
  await supabase.from("conversations").update({ last_message_preview: content, last_message_at: new Date().toISOString() }).eq("id", conversationId);
};

const getMembershipContext = async (supabase: ReturnType<typeof createSupabaseAdminClient>, conversationId: string, userId: string) => {
  const [{ data: conversation }, { data: membership }] = await Promise.all([
    supabase.from("conversations").select("id,type,name").eq("id", conversationId).maybeSingle(),
    supabase
      .from("conversation_members")
      .select("conversation_id,user_id,role,joined_at")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .is("left_at", null)
      .maybeSingle(),
  ]);

  return { conversation, membership };
};

const ensureCanInvite = async (supabase: ReturnType<typeof createSupabaseAdminClient>, currentUserId: string, userIds: string[]) => {
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

  if ((blockedRows ?? []).length > 0) return "Blockierte Konten koennen nicht hinzugefuegt werden.";
  const followers = new Set((followerRows ?? []).map((row) => row.follower_id));
  for (const target of profiles ?? []) {
    if (target.is_banned) return "Ein ausgewaehltes Konto ist nicht verfuegbar.";
    if ((target as any).who_can_add_to_groups === "followers" && !followers.has(target.id)) {
      const name = `${target.first_name ?? ""} ${target.last_name ?? ""}`.trim() || target.username;
      return `${name} erlaubt Gruppen-Einladungen nur von Followern.`;
    }
  }
  return null;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const { id: conversationId } = await params;
  const parsed = groupActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Gruppenaktion ungueltig." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { conversation, membership } = await getMembershipContext(supabase, conversationId, profile.id);
  if (!conversation || !["group", "event"].includes(conversation.type)) {
    return NextResponse.json({ error: "Das ist kein Gruppenchat." }, { status: 404 });
  }
  if (!membership && profile.role !== "admin") return NextResponse.json({ error: "Kein Zugriff auf diese Gruppe." }, { status: 403 });

  const isAdmin = membership?.role === "admin" || profile.role === "admin";
  const requiresAdmin = ["rename", "setAvatar", "addMembers", "removeMember", "promote", "demote"].includes(parsed.data.action);
  if (requiresAdmin && !isAdmin) return NextResponse.json({ error: "Nur Gruppen-Admins koennen diese Aktion ausfuehren." }, { status: 403 });

  if (conversation.type === "event" && ["addMembers", "removeMember"].includes(parsed.data.action) && profile.role !== "admin") {
    return NextResponse.json({ error: "Event-Chat-Mitglieder werden ueber gueltige Tickets verwaltet." }, { status: 403 });
  }

  if (parsed.data.action === "rename") {
    const { error } = await supabase.from("conversations").update({ name: parsed.data.name }).eq("id", conversationId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await systemMessage(supabase, conversationId, profile.id, `Gruppe umbenannt in "${parsed.data.name}"`);
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "setAvatar") {
    const { error } = await supabase.from("conversations").update({ avatar_url: parsed.data.avatarUrl }).eq("id", conversationId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await systemMessage(supabase, conversationId, profile.id, "Gruppenbild aktualisiert");
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "setNickname") {
    const targetUserId = parsed.data.userId ?? profile.id;
    if (targetUserId !== profile.id && !isAdmin) return NextResponse.json({ error: "Nur Admins koennen andere Spitznamen aendern." }, { status: 403 });
    const { error } = await supabase
      .from("conversation_members")
      .update({ nickname: parsed.data.nickname || null })
      .eq("conversation_id", conversationId)
      .eq("user_id", targetUserId)
      .is("left_at", null);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "addMembers") {
    const { count } = await supabase
      .from("conversation_members")
      .select("user_id", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .is("left_at", null);
    const nextCount = (count ?? 0) + parsed.data.userIds.length;
    if (conversation.type === "group" && nextCount > 250) return NextResponse.json({ error: "Gruppen sind auf 250 Mitglieder begrenzt." }, { status: 400 });

    const inviteError = await ensureCanInvite(supabase, profile.id, parsed.data.userIds);
    if (inviteError) return NextResponse.json({ error: inviteError }, { status: 403 });

    const rows = parsed.data.userIds.map((userId) => ({
      conversation_id: conversationId,
      user_id: userId,
      role: "member",
      left_at: null,
    }));
    const { error } = await supabase.from("conversation_members").upsert(rows, { onConflict: "conversation_id,user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await systemMessage(supabase, conversationId, profile.id, `${parsed.data.userIds.length} Person(en) hinzugefuegt`);
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "removeMember") {
    if (parsed.data.userId === profile.id) return NextResponse.json({ error: "Nutze 'Chat verlassen' fuer dich selbst." }, { status: 400 });
    const { error } = await supabase
      .from("conversation_members")
      .update({ left_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", parsed.data.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await systemMessage(supabase, conversationId, profile.id, "Eine Person wurde aus der Gruppe entfernt");
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "promote" || parsed.data.action === "demote") {
    if (parsed.data.action === "demote") {
      const { count } = await supabase
        .from("conversation_members")
        .select("user_id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("role", "admin")
        .is("left_at", null);
      if ((count ?? 0) <= 1) return NextResponse.json({ error: "Mindestens ein Admin muss bleiben." }, { status: 400 });
    }
    const role = parsed.data.action === "promote" ? "admin" : "member";
    const { error } = await supabase
      .from("conversation_members")
      .update({ role })
      .eq("conversation_id", conversationId)
      .eq("user_id", parsed.data.userId)
      .is("left_at", null);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await systemMessage(supabase, conversationId, profile.id, role === "admin" ? "Ein Mitglied ist jetzt Admin" : "Ein Admin wurde zum Mitglied gemacht");
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "leave") {
    const { data: admins } = await supabase
      .from("conversation_members")
      .select("user_id,joined_at")
      .eq("conversation_id", conversationId)
      .eq("role", "admin")
      .is("left_at", null)
      .order("joined_at", { ascending: true });

    if ((admins ?? []).length === 1 && admins?.[0]?.user_id === profile.id) {
      const { data: successor } = await supabase
        .from("conversation_members")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .neq("user_id", profile.id)
        .is("left_at", null)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (successor?.user_id) {
        await supabase.from("conversation_members").update({ role: "admin" }).eq("conversation_id", conversationId).eq("user_id", successor.user_id);
      }
    }

    const { error } = await supabase
      .from("conversation_members")
      .update({ left_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", profile.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await systemMessage(supabase, conversationId, profile.id, "Ein Mitglied hat die Gruppe verlassen");
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "mute") {
    const { error } = await supabase
      .from("conversation_members")
      .update({ is_muted: parsed.data.muted, muted: parsed.data.muted })
      .eq("conversation_id", conversationId)
      .eq("user_id", profile.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Aktion nicht unterstuetzt." }, { status: 400 });
}
