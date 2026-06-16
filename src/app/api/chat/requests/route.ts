import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const requestActionSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["accept", "delete", "block"]),
});

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = requestActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Anfrage ungueltig." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: messageRequest, error: readError } = await supabase
    .from("message_requests")
    .select("id,conversation_id,from_user_id,requester_id,to_user_id,target_id")
    .eq("id", parsed.data.requestId)
    .eq("to_user_id", profile.id)
    .maybeSingle();

  if (readError) return NextResponse.json({ error: readError.message }, { status: 400 });
  if (!messageRequest) return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });

  const fromUserId = messageRequest.from_user_id ?? messageRequest.requester_id;
  if (parsed.data.action === "block") {
    await supabase.from("blocks").upsert({ blocker_id: profile.id, blocked_id: fromUserId }, { onConflict: "blocker_id,blocked_id" });
  }

  const status = parsed.data.action === "accept" ? "accepted" : "declined";
  const { error } = await supabase.from("message_requests").update({ status }).eq("id", parsed.data.requestId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (parsed.data.action === "accept" && messageRequest.conversation_id) {
    await supabase.rpc("mark_conversation_read", { p_conversation_id: messageRequest.conversation_id, p_user_id: profile.id });
  }

  return NextResponse.json({ ok: true, conversationId: messageRequest.conversation_id });
}
