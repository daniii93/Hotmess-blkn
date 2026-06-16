import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildUsernameCandidates, normalizeUsername, USERNAME_REGEX, usernameRuleText } from "@/lib/username";

async function freeSuggestions(desired: string) {
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = normalizeUsername(url.searchParams.get("username") ?? "");

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json({
      available: false,
      normalized: username,
      reason: "invalid",
      message: usernameRuleText,
      suggestions: await freeSuggestions(username || "hotmess"),
    });
  }

  const supabase = createSupabaseAdminClient();
  const [{ data }, { data: released }] = await Promise.all([
    supabase.from("profiles").select("id").eq("username", username).maybeSingle(),
    supabase.from("released_usernames").select("cooldown_until").eq("username", username).maybeSingle(),
  ]);
  const inCooldown = Boolean(released?.cooldown_until && new Date(released.cooldown_until) > new Date());
  const available = !data && !inCooldown;

  return NextResponse.json({
    available,
    normalized: username,
    reason: available ? null : inCooldown ? "cooldown" : "taken",
    message: available ? "Benutzername ist verfuegbar." : inCooldown ? "Dieser Benutzername ist vor kurzem freigegeben worden und noch kurz geschuetzt." : "Benutzername ist bereits vergeben.",
    suggestions: available ? [] : await freeSuggestions(username),
  });
}
