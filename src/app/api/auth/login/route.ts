import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicEnv } from "@/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeUsername } from "@/lib/username";

const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(8),
});

const invalidLogin = () => NextResponse.json({ error: "E-Mail/Benutzername oder Passwort ist nicht korrekt." }, { status: 401 });

const resolveLoginEmail = async (identifier: string) => {
  if (identifier.includes("@")) return identifier.toLowerCase();

  const username = normalizeUsername(identifier);
  if (!username) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("email")
    .eq("username", username)
    .maybeSingle();

  if (error || !data?.email) return null;
  return data.email;
};

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Bitte E-Mail oder Benutzername und Passwort eingeben." }, { status: 400 });
  }

  const email = await resolveLoginEmail(parsed.data.identifier);
  if (!email) return invalidLogin();

  const env = getPublicEnv();
  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => [],
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) return invalidLogin();

  return response;
}
