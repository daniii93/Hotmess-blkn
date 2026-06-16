import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const qrSchema = z.object({
  color: z.enum(["gold", "ink", "champagne"]),
});

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = qrSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltige Farbe." }, { status: 400 });

  const { error } = await supabase.from("profiles").update({ qr_color: parsed.data.color }).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
