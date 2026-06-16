import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const noteSchema = z.object({
  text: z.string().trim().min(1).max(60),
  audience: z.enum(["friends", "close_friends"]).default("friends"),
});

const noteActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("like"), noteUserId: z.string().uuid() }),
  z.object({ action: z.literal("reply"), noteUserId: z.string().uuid(), text: z.string().trim().min(1).max(1000) }),
]);

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = noteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Notiz ungueltig." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("user_notes").upsert({
    user_id: profile.id,
    text: parsed.data.text,
    audience: parsed.data.audience,
    created_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("user_notes").delete().eq("user_id", profile.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = noteActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Notiz-Aktion ungueltig." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: note } = await supabase
    .from("user_notes")
    .select("user_id,expires_at")
    .eq("user_id", parsed.data.noteUserId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!note) return NextResponse.json({ error: "Notiz nicht mehr verfuegbar." }, { status: 404 });

  if (parsed.data.action === "like") {
    const { error } = await supabase.from("note_likes").upsert({ note_user_id: note.user_id, liker_id: profile.id }, { onConflict: "note_user_id,liker_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const { data: conversationId, error: conversationError } = await supabase.rpc("create_direct_conversation", {
    p_user_a: profile.id,
    p_user_b: note.user_id,
  });
  if (conversationError) return NextResponse.json({ error: conversationError.message }, { status: 400 });

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: profile.id,
    type: "text",
    content: parsed.data.text,
    body: parsed.data.text,
  });
  await supabase.from("note_replies").insert({
    note_user_id: note.user_id,
    replier_id: profile.id,
    text: parsed.data.text,
    conversation_id: conversationId,
  });

  return NextResponse.json({ ok: true, conversationId });
}
