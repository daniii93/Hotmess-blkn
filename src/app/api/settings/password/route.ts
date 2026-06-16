import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicEnv } from "@/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = passwordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Das neue Passwort braucht mindestens 8 Zeichen, einen Grossbuchstaben und eine Zahl." }, { status: 400 });
  }

  const publicEnv = getPublicEnv();
  const verifier = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError) return NextResponse.json({ error: "Aktuelles Passwort ist nicht korrekt." }, { status: 403 });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, { password: parsed.data.newPassword });
  if (error) return NextResponse.json({ error: "Passwort konnte nicht geaendert werden." }, { status: 500 });

  await admin.from("account_audit").insert({
    user_id: user.id,
    action: "password_change",
    detail: { source: "settings" },
  });

  return NextResponse.json({ ok: true });
}
