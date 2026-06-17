import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getPublicEnv } from "@/config/env";

export async function GET(request: Request) {
  const env = getPublicEnv();
  const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = [];

  const cookieHeader = request.headers.get("cookie") ?? "";
  const requestCookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const separatorIndex = cookie.indexOf("=");
      if (separatorIndex === -1) return { name: cookie, value: "" };
      return {
        name: cookie.slice(0, separatorIndex),
        value: decodeURIComponent(cookie.slice(separatorIndex + 1)),
      };
    });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return requestCookies;
      },
      setAll(nextCookies) {
        cookiesToSet.push(...nextCookies);
      },
    },
  });

  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/login", request.url));
  cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  response.cookies.set("hotmess_demo_admin", "", { maxAge: 0, path: "/" });

  return response;
}
