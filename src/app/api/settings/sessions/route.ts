import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const { data } = await supabase
    .from("user_sessions")
    .select("id,device_label,ip_hash,last_seen_at,created_at,is_trusted,trusted_at")
    .eq("user_id", user.id)
    .order("last_seen_at", { ascending: false });

  return NextResponse.json({ sessions: data ?? [] });
}

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltige Sitzung." }, { status: 400 });

  const { error } = await supabase.from("user_sessions").delete().eq("user_id", user.id).eq("id", parsed.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
