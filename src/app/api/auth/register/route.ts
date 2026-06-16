import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildUsernameCandidates, normalizeUsername, USERNAME_REGEX } from "@/lib/username";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2).max(40),
  lastName: z.string().min(2).max(40),
  dateOfBirth: z.string().min(1),
  gender: z.enum(["female", "male", "diverse"]),
  username: z.string().min(3).max(30).regex(/^[a-z0-9._]+$/),
});

const isAdult = (dateOfBirth: string) => {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return false;
  const today = new Date();
  const eighteenthBirthday = new Date(birthDate.getFullYear() + 18, birthDate.getMonth(), birthDate.getDate());
  return eighteenthBirthday <= today;
};

async function getUsernameSuggestions(desired: string) {
  const supabase = createSupabaseAdminClient();
  const candidates = buildUsernameCandidates(desired);
  if (!candidates.length) return [];
  const [{ data: profileRows }, { data: cooldownRows }] = await Promise.all([
    supabase.from("profiles").select("username").in("username", candidates),
    supabase.from("released_usernames").select("username,cooldown_until").in("username", candidates),
  ]);
  const taken = new Set((profileRows ?? []).map((row) => row.username));
  const cooled = new Set((cooldownRows ?? []).filter((row) => row.cooldown_until && new Date(row.cooldown_until) > new Date()).map((row) => row.username));
  return candidates.filter((candidate) => !taken.has(candidate) && !cooled.has(candidate)).slice(0, 6);
}

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
  const username = normalizeUsername(input.username);

  if (!isAdult(input.dateOfBirth)) {
    return NextResponse.json({ error: "Du musst mindestens 18 Jahre alt sein." }, { status: 400 });
  }

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json({ error: "Benutzername ungueltig. Erlaubt sind 3-30 Zeichen: a-z, 0-9, Punkt oder Unterstrich." }, { status: 400 });
  }

  const [{ data: existingProfile }, { data: releasedUsername }] = await Promise.all([
    supabase.from("profiles").select("id").eq("username", username).maybeSingle(),
    supabase.from("released_usernames").select("cooldown_until").eq("username", username).maybeSingle(),
  ]);
  const inCooldown = Boolean(releasedUsername?.cooldown_until && new Date(releasedUsername.cooldown_until) > new Date());
  if (existingProfile || inCooldown) {
    return NextResponse.json(
      {
        error: inCooldown ? "Dieser Benutzername ist vor kurzem freigegeben worden und noch kurz geschuetzt." : "Dieser Benutzername ist bereits vergeben.",
        suggestions: await getUsernameSuggestions(username),
      },
      { status: 409 },
    );
  }

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
      is_private: true,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    await supabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: "Profil konnte nicht erstellt werden." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
