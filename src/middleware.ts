import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { refreshSupabaseSession } from "./lib/supabase/middleware";

type ProfileAccess = {
  role: "user" | "scanner" | "admin";
  dating_enabled: boolean | null;
  business_enabled: boolean | null;
  onboarding_completed: boolean | null;
  is_banned: boolean | null;
};

const publicPrefixes = ["/", "/event", "/login", "/register", "/reset-password", "/impressum", "/agb", "/datenschutz", "/partner", "/demo-admin", "/logout", "/profile", "/profile/edit", "/settings"] as const;
const appPrefixes = ["/feed", "/watch", "/create", "/explore", "/events", "/checkout", "/tickets", "/friends", "/chat", "/notifications", "/u", "/profile/edit", "/settings", "/onboarding", "/verify"] as const;
const datingPrefixes = ["/dating"] as const;
const businessPrefixes = ["/business"] as const;
const scannerPrefixes = ["/scanner"] as const;
const adminPrefixes = ["/admin"] as const;

const hasPrefix = (pathname: string, prefixes: readonly string[]): boolean =>
  prefixes.some((prefix) => pathname === prefix || (prefix !== "/" && pathname.startsWith(`${prefix}/`)));

const isPublicPath = (pathname: string): boolean => {
  if (pathname === "/") return true;
  if (pathname.startsWith("/event/") && pathname.endsWith("/preview")) return true;
  return hasPrefix(pathname, publicPrefixes.filter((prefix) => prefix !== "/" && prefix !== "/event" && prefix !== "/profile")) || pathname === "/profile";
};

const withSupabaseCookies = (target: NextResponse, source: NextResponse) => {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
};

const redirectWithSession = (request: NextRequest, response: NextResponse, pathname: string) => {
  return withSupabaseCookies(NextResponse.redirect(new URL(pathname, request.url)), response);
};

const redirectToLogin = (request: NextRequest, response: NextResponse) => {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("returnTo", request.nextUrl.pathname);
  return withSupabaseCookies(NextResponse.redirect(url), response);
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { response, supabase, user } = await refreshSupabaseSession(request);
  const isLocalPreview = ["localhost", "127.0.0.1", "0.0.0.0"].includes(request.nextUrl.hostname);
  const demoModeEnabled = process.env.DEMO_MODE === "1";
  const hasDemoAdmin = (isLocalPreview || demoModeEnabled) && request.cookies.get("hotmess_demo_admin")?.value === "1";

  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/")) {
    return response;
  }

  if (isPublicPath(pathname)) {
    return response;
  }

  if (
    hasDemoAdmin &&
    (
      hasPrefix(pathname, appPrefixes) ||
      hasPrefix(pathname, datingPrefixes) ||
      hasPrefix(pathname, businessPrefixes) ||
      hasPrefix(pathname, scannerPrefixes) ||
      hasPrefix(pathname, adminPrefixes)
    )
  ) {
    return response;
  }

  if (
    hasPrefix(pathname, appPrefixes) ||
    hasPrefix(pathname, datingPrefixes) ||
    hasPrefix(pathname, businessPrefixes) ||
    hasPrefix(pathname, scannerPrefixes) ||
    hasPrefix(pathname, adminPrefixes)
  ) {
    if (!user) {
      return redirectToLogin(request, response);
    }
  }

  const fallbackRole = String(user?.user_metadata?.role ?? "user") as ProfileAccess["role"];
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, dating_enabled, business_enabled, onboarding_completed, is_banned")
    .eq("id", user?.id ?? "")
    .maybeSingle<ProfileAccess>();

  const role = profile?.role ?? fallbackRole;
  const datingEnabled = profile?.dating_enabled ?? Boolean(user?.user_metadata?.dating_enabled);
  const onboardingCompleted = profile?.onboarding_completed ?? Boolean(user?.user_metadata?.onboarding_completed);

  if (profile?.is_banned) {
    return redirectWithSession(request, response, "/");
  }

  if (
    user &&
    !onboardingCompleted &&
    pathname !== "/onboarding" &&
    pathname !== "/settings" &&
    pathname !== "/verify"
  ) {
    return redirectWithSession(request, response, "/onboarding");
  }

  if (hasPrefix(pathname, adminPrefixes) && role !== "admin") {
    return redirectWithSession(request, response, "/");
  }

  if (hasPrefix(pathname, scannerPrefixes) && role !== "scanner" && role !== "admin") {
    return redirectWithSession(request, response, "/");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
