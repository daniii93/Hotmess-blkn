import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("react"), emoji: z.string().min(1).max(8) }),
  z.object({ action: z.literal("unreact") }),
  z.object({ action: z.literal("edit"), content: z.string().min(1).max(4000) }),
  z.object({ action: z.literal("unsend") }),
  z.object({ action: z.literal("pin") }),
  z.object({ action: z.literal("unpin") }),
  z.object({ action: z.literal("report"), reason: z.string().min(1).max(120).default("chat_message_report") }),
  z.object({ action: z.literal("forward"), conversationIds: z.array(z.string().uuid()).min(1).max(5), note: z.string().max(500).optional() }),
]);

type Params = {
  params: Promise<{ messageId: string }>;
};

const canAccessConversation = async (supabase: ReturnType<typeof createSupabaseAdminClient>, conversationId: string, userId: string, role?: string | null) => {
  if (role === "admin") return true;
  const { data } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .is("left_at", null)
    .maybeSingle();
  return Boolean(data);
};

export async function POST(request: Request, { params }: Params) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nachrichtenaktion ungueltig." }, { status: 400 });

  const { messageId } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: message, error: messageError } = await supabase
    .from("messages")
    .select("id,conversation_id,sender_id,type,content,body,created_at,edited,edit_history,is_deleted_for_all,is_pinned")
    .eq("id", messageId)
    .maybeSingle();

  if (messageError) return NextResponse.json({ error: messageError.message }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Nachricht nicht gefunden." }, { status: 404 });

  const hasAccess = await canAccessConversation(supabase, message.conversation_id, profile.id, profile.role);
  if (!hasAccess) return NextResponse.json({ error: "Kein Zugriff auf diese Nachricht." }, { status: 403 });

  if (parsed.data.action === "react") {
    const { error } = await supabase
      .from("message_reactions")
      .upsert({ message_id: message.id, user_id: profile.id, emoji: parsed.data.emoji }, { onConflict: "message_id,user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "unreact") {
    await supabase.from("message_reactions").delete().eq("message_id", message.id).eq("user_id", profile.id);
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "edit") {
    if (message.sender_id !== profile.id) return NextResponse.json({ error: "Du kannst nur eigene Nachrichten bearbeiten." }, { status: 403 });
    if (message.edited) return NextResponse.json({ error: "Diese Nachricht wurde bereits bearbeitet." }, { status: 429 });
    if (message.is_deleted_for_all) return NextResponse.json({ error: "Zurueckgerufene Nachrichten koennen nicht bearbeitet werden." }, { status: 400 });
    if (message.type !== "text") return NextResponse.json({ error: "Nur Textnachrichten koennen bearbeitet werden." }, { status: 400 });
    if (parsed.data.content.includes("@") || parsed.data.content.startsWith("/")) {
      return NextResponse.json({ error: "Nachrichten mit @mentions oder Befehlen koennen nur zurueckgerufen werden." }, { status: 400 });
    }
    const ageMs = Date.now() - new Date(message.created_at).getTime();
    if (ageMs > 15 * 60 * 1000) return NextResponse.json({ error: "Bearbeiten ist nur innerhalb von 15 Minuten moeglich." }, { status: 429 });

    const history = Array.isArray(message.edit_history) ? message.edit_history : [];
    const { error } = await supabase
      .from("messages")
      .update({
        content: parsed.data.content,
        body: parsed.data.content,
        edited: true,
        edited_at: new Date().toISOString(),
        edit_history: [...history, { content: message.content ?? message.body, edited_at: new Date().toISOString(), editor_id: profile.id }],
      })
      .eq("id", message.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "unsend") {
    if (message.sender_id !== profile.id && profile.role !== "admin") return NextResponse.json({ error: "Du kannst nur eigene Nachrichten zurueckrufen." }, { status: 403 });
    const { error } = await supabase.from("messages").update({ is_deleted_for_all: true, content: null, body: null }).eq("id", message.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "pin" || parsed.data.action === "unpin") {
    if (parsed.data.action === "pin") {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", message.conversation_id)
        .eq("is_pinned", true);
      if ((count ?? 0) >= 3 && !message.is_pinned) return NextResponse.json({ error: "Maximal 3 Nachrichten koennen angepinnt werden." }, { status: 429 });
    }
    const { error } = await supabase.from("messages").update({ is_pinned: parsed.data.action === "pin" }).eq("id", message.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "report") {
    await supabase.from("moderation_queue").insert({
      content_type: "message",
      content_id: message.id,
      reported_user_id: message.sender_id,
      reporter_id: profile.id,
      source: "chat",
      reason: parsed.data.reason,
      detail: "Nachricht aus dem Chat gemeldet. Bearbeitete/zurueckgerufene Inhalte koennen fuer Moderation enthalten sein.",
    });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "forward") {
    const targets = parsed.data.conversationIds.slice(0, 5);
    for (const conversationId of targets) {
      const canForward = await canAccessConversation(supabase, conversationId, profile.id, profile.role);
      if (!canForward) continue;
      const content = parsed.data.note?.trim() || message.content || message.body || "Weitergeleitete Nachricht";
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        type: message.type,
        content,
        body: content,
        reply_to_id: message.id,
      });
    }
    return NextResponse.json({ ok: true, forwarded: targets.length });
  }

  return NextResponse.json({ error: "Aktion nicht unterstuetzt." }, { status: 400 });
}
