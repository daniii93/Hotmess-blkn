import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const callSchema = z.object({
  conversationId: z.string().uuid(),
  type: z.enum(["audio", "video"]),
});

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = callSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Anruf ungueltig." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const [{ data: membership }, { data: conversation, error: conversationError }] = await Promise.all([
    supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("conversation_id", parsed.data.conversationId)
      .eq("user_id", profile.id)
      .is("left_at", null)
      .maybeSingle(),
    supabase.from("conversations").select("id,calls_enabled").eq("id", parsed.data.conversationId).maybeSingle(),
  ]);

  if (!membership && profile.role !== "admin") return NextResponse.json({ error: "Kein Zugriff auf diesen Chat." }, { status: 403 });
  if (conversationError && /calls_enabled/i.test(conversationError.message)) {
    return NextResponse.json(
      { error: "Anrufe sind vorbereitet, aber noch nicht aktiviert. Die Datenbank-Migration fuer calls_enabled muss noch eingespielt werden." },
      { status: 501 },
    );
  }
  if (conversationError) return NextResponse.json({ error: conversationError.message }, { status: 400 });
  if (!conversation?.calls_enabled) {
    return NextResponse.json(
      { error: "Anrufe sind vorbereitet, aber noch nicht aktiviert. Fuer Live-Anrufe braucht HotMess WebRTC, TURN und SFU-Infrastruktur." },
      { status: 501 },
    );
  }

  const { data: call, error } = await supabase
    .from("calls")
    .insert({
      conversation_id: parsed.data.conversationId,
      started_by: profile.id,
      type: parsed.data.type,
      max_participants: 8,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("call_participants").insert({ call_id: call.id, user_id: profile.id, joined_at: new Date().toISOString() });

  return NextResponse.json({ ok: true, callId: call.id });
}
