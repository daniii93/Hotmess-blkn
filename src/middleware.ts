import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { refreshSupabaseSession } from "./lib/supabase/middleware";

type ProfileAccess = {
  role: "user" | "scanner" | "admin";
  dating_enabled: boolean | null;
  business_enabled: boolean | null;
  onboarding_completed: boolean | null;
  verification_status: "pending" | "verified" | "rejected" | "suspended" | "unverified" | null;
  is_banned: boolean | null;
};

const publicPrefixes = ["/", "/event", "/login", "/register", "/reset-password", "/impressum", "/agb", "/datenschutz", "/partner", "/trust", "/demo-admin", "/logout", "/profile", "/profile/edit", "/settings"] as const;
const appPrefixes = ["/discover", "/connect", "/feed", "/watch", "/create", "/explore", "/events", "/checkout", "/tickets", "/friends", "/chat", "/notifications", "/u", "/profile/edit", "/settings", "/onboarding", "/verify", "/local-services", "/services", "/benefits", "/membership", "/creator", "/digital-ai"] as const;
const datingPrefixes = ["/dating"] as const;
const businessPrefixes = ["/business"] as const;
const scannerPrefixes = ["/scanner"] as const;
const adminPrefixes = ["/admin"] as const;
const unverifiedAllowedPrefixes = ["/profile", "/profile/edit", "/settings", "/verify", "/onboarding", "/logout"] as const;
const authApiPrefixes = ["/api/auth", "/auth"] as const;
const publicApiPrefixes = ["/api/webhooks", "/api/cron", "/api/paypal/capture"] as const;
const setupApiPrefixes = ["/api/profile", "/api/settings"] as const;
const verifiedApiPrefixes = ["/api/chat", "/api/social", "/api/dating", "/api/business", "/api/events", "/api/tickets", "/api/local-services"] as const;
const adminApiPrefixes = ["/api/admin"] as const;
const scannerApiPrefixes = ["/api/scanner"] as const;

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

const redirectToVerification = (request: NextRequest, response: NextResponse) => {
  const url = request.nextUrl.clone();
  url.pathname = "/verify";
  url.searchParams.set("required", "1");
  return withSupabaseCookies(NextResponse.redirect(url), response);
};

const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { response, supabase, user } = await refreshSupabaseSession(request);
  const isLocalPreview = ["localhost", "127.0.0.1", "0.0.0.0"].includes(request.nextUrl.hostname);
  const demoModeEnabled = process.env.DEMO_MODE === "1";
  const hasDemoAdmin = (isLocalPreview || demoModeEnabled) && request.cookies.get("hotmess_demo_admin")?.value === "1";

  if (hasPrefix(pathname, authApiPrefixes) || hasPrefix(pathname, publicApiPrefixes)) {
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

  const needsAppSession =
    hasPrefix(pathname, appPrefixes) ||
    hasPrefix(pathname, datingPrefixes) ||
    hasPrefix(pathname, businessPrefixes) ||
    hasPrefix(pathname, scannerPrefixes) ||
    hasPrefix(pathname, adminPrefixes);
  const needsApiSession =
    hasPrefix(pathname, setupApiPrefixes) ||
    hasPrefix(pathname, verifiedApiPrefixes) ||
    hasPrefix(pathname, scannerApiPrefixes) ||
    hasPrefix(pathname, adminApiPrefixes);

  if (needsAppSession || needsApiSession) {
    if (!user) {
      return needsApiSession ? jsonError("Bitte zuerst einloggen.", 401) : redirectToLogin(request, response);
    }
  }

  if (pathname.startsWith("/api/") && !needsApiSession) {
    return response;
  }

  const fallbackRole = String(user?.user_metadata?.role ?? "user") as ProfileAccess["role"];
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, dating_enabled, business_enabled, onboarding_completed, verification_status, is_banned")
    .eq("id", user?.id ?? "")
    .maybeSingle<ProfileAccess>();

  const role = profile?.role ?? fallbackRole;
  const datingEnabled = profile?.dating_enabled ?? Boolean(user?.user_metadata?.dating_enabled);
  const onboardingCompleted = profile?.onboarding_completed ?? Boolean(user?.user_metadata?.onboarding_completed);
  const verificationStatus = profile?.verification_status ?? String(user?.user_metadata?.verification_status ?? "pending");
  const verified = verificationStatus === "verified";

  if (profile?.is_banned) {
    return pathname.startsWith("/api/") ? jsonError("Konto gesperrt.", 403) : redirectWithSession(request, response, "/");
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

  if (
    user &&
    !verified &&
    !hasPrefix(pathname, unverifiedAllowedPrefixes) &&
    !hasPrefix(pathname, setupApiPrefixes) &&
    !hasPrefix(pathname, authApiPrefixes)
  ) {
    if (pathname.startsWith("/api/")) {
      return jsonError("Verifizierung erforderlich. Bitte bestaetige deine Identitaet, um HotMess nutzen zu koennen.", 403);
    }
    return redirectToVerification(request, response);
  }

  if ((hasPrefix(pathname, adminPrefixes) || hasPrefix(pathname, adminApiPrefixes)) && role !== "admin") {
    if (pathname.startsWith("/api/")) return jsonError("Admin-Zugriff erforderlich.", 403);
    return redirectWithSession(request, response, "/");
  }

  if ((hasPrefix(pathname, scannerPrefixes) || hasPrefix(pathname, scannerApiPrefixes)) && role !== "scanner" && role !== "admin") {
    if (pathname.startsWith("/api/")) return jsonError("Scanner-Zugriff erforderlich.", 403);
    return redirectWithSession(request, response, "/");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
