import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getPublicEnv } from "@/config/env";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    access_token?: string;
    refresh_token?: string;
  } | null;

  if (!payload?.access_token || !payload?.refresh_token) {
    return NextResponse.json({ error: "Missing session." }, { status: 400 });
  }

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

  const { error } = await supabase.auth.setSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return response;
}
