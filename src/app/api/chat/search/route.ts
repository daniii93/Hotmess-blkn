import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

export async function GET(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ people: [], conversations: [] });

  const supabase = createSupabaseAdminClient();
  const [{ data: people }, { data: memberships }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,first_name,last_name,username,avatar_url,city")
      .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .neq("id", profile.id)
      .eq("is_banned", false)
      .limit(8),
    supabase
      .from("conversation_members")
      .select("conversation_id,conversations(id,type,name,last_message_preview,last_message_at)")
      .eq("user_id", profile.id)
      .is("left_at", null)
      .limit(12),
  ]);

  const conversations = (memberships ?? [])
    .map((row: any) => (Array.isArray(row.conversations) ? row.conversations[0] : row.conversations))
    .filter((conversation: any) => `${conversation?.name ?? ""} ${conversation?.last_message_preview ?? ""}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  return NextResponse.json({
    people: (people ?? []).map((item) => ({
      id: item.id,
      name: `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim() || item.username,
      username: item.username,
      avatarUrl: item.avatar_url,
      city: item.city,
    })),
    conversations,
  });
}
