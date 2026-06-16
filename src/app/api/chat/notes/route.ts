import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const noteSchema = z.object({
  text: z.string().trim().min(1).max(60),
  audience: z.enum(["friends", "close_friends"]).default("friends"),
});

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
