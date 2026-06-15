import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2).max(40),
  lastName: z.string().min(2).max(40),
  dateOfBirth: z.string().min(1),
  gender: z.enum(["female", "male", "diverse"]),
  username: z.string().min(3).max(30).regex(/^[a-z0-9._]+$/),
});

const normalizeUsername = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, 24);

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Ungueltige Registrierungsdaten." }, { status: 400 });
  }

  const input = parsed.data;
  const env = getServerEnv();

  if (!env.supabaseServiceRoleKey) {
    return NextResponse.json({ error: "Registrierung ist noch nicht konfiguriert." }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  const usernameBase = normalizeUsername(input.username) || "user";
  const username = `${usernameBase}.${Math.random().toString(36).slice(2, 7)}`.slice(0, 30);

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      first_name: input.firstName,
      last_name: input.lastName,
      date_of_birth: input.dateOfBirth,
      gender: input.gender,
      username,
      onboarding_completed: false,
      role: "user",
    },
  });

  if (createError || !created.user) {
    const message = createError?.message.toLowerCase() ?? "";
    const alreadyExists = message.includes("already") || message.includes("registered") || message.includes("exists");

    return NextResponse.json(
      { error: alreadyExists ? "Diese E-Mail ist bereits registriert. Bitte melde dich direkt an." : "Konto konnte nicht erstellt werden." },
      { status: alreadyExists ? 409 : 500 },
    );
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: created.user.id,
      email: input.email,
      username,
      first_name: input.firstName,
      last_name: input.lastName,
      date_of_birth: input.dateOfBirth,
      gender: input.gender,
      role: "user",
      verification_status: "unverified",
      onboarding_completed: false,
      is_banned: false,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    await supabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "Profil konnte nicht erstellt werden." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
