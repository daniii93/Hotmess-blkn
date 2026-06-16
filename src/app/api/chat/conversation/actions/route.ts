import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const actionSchema = z.object({
  conversationId: z.string().uuid(),
  action: z.enum(["mute", "unmute", "read", "unread", "archive", "unarchive", "delete", "block", "report"]),
});

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Aktion ungueltig." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", parsed.data.conversationId)
    .eq("user_id", profile.id)
    .is("left_at", null)
    .maybeSingle();

  if (!membership && profile.role !== "admin") return NextResponse.json({ error: "Kein Zugriff auf diesen Chat." }, { status: 403 });

  if (parsed.data.action === "block" || parsed.data.action === "report") {
    const { data: members } = await supabase
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", parsed.data.conversationId)
      .neq("user_id", profile.id)
      .is("left_at", null)
      .limit(1);

    const targetId = members?.[0]?.user_id;
    if (targetId && parsed.data.action === "block") {
      await supabase.from("blocks").upsert({ blocker_id: profile.id, blocked_id: targetId }, { onConflict: "blocker_id,blocked_id" });
      await supabase.rpc("set_conversation_member_state", {
        p_conversation_id: parsed.data.conversationId,
        p_user_id: profile.id,
        p_action: "delete",
      });
    }

    if (targetId && parsed.data.action === "report") {
      await supabase.from("moderation_queue").insert({
        content_type: "message",
        content_id: parsed.data.conversationId,
        reported_user_id: targetId,
        reporter_id: profile.id,
        source: "chat",
        reason: "chat_report",
        detail: "Chat wurde aus dem Posteingang gemeldet.",
      });
    }

    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.rpc("set_conversation_member_state", {
    p_conversation_id: parsed.data.conversationId,
    p_user_id: profile.id,
    p_action: parsed.data.action,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
