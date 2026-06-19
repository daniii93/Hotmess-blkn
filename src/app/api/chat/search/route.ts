import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

export async function GET(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  if (profile.is_banned) return NextResponse.json({ error: "Konto gesperrt." }, { status: 403 });
  if (profile.verification_status !== "verified") return NextResponse.json({ error: "Verifizierung erforderlich." }, { status: 403 });

  const query = (new URL(request.url).searchParams.get("q")?.trim() ?? "").replace(/[,%()]/g, " ");
  if (query.length < 2) return NextResponse.json({ people: [], conversations: [] });

  const supabase = createSupabaseAdminClient();
  const [{ data: people, error: peopleError }, { data: memberships, error: membershipError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,first_name,last_name,username,avatar_url,city,verification_status,is_banned")
      .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .neq("id", profile.id)
      .eq("is_banned", false)
      .eq("verification_status", "verified")
      .limit(8),
    supabase
      .from("conversation_members")
      .select("conversation_id,conversations(id,type,name,last_message_preview,last_message_at)")
      .eq("user_id", profile.id)
      .is("left_at", null)
      .limit(12),
  ]);

  if (peopleError) return NextResponse.json({ error: peopleError.message }, { status: 400 });
  if (membershipError) return NextResponse.json({ error: membershipError.message }, { status: 400 });

  const candidateIds = (people ?? []).map((item) => item.id);
  const { data: blocks, error: blocksError } = candidateIds.length
    ? await supabase
        .from("blocks")
        .select("blocker_id,blocked_id")
        .or(
          candidateIds
            .map((id) => `and(blocker_id.eq.${profile.id},blocked_id.eq.${id}),and(blocker_id.eq.${id},blocked_id.eq.${profile.id})`)
            .join(","),
        )
    : { data: [], error: null };

  if (blocksError) return NextResponse.json({ error: blocksError.message }, { status: 400 });
  const blockedIds = new Set((blocks ?? []).map((row) => (row.blocker_id === profile.id ? row.blocked_id : row.blocker_id)));

  const conversations = (memberships ?? [])
    .map((row: any) => (Array.isArray(row.conversations) ? row.conversations[0] : row.conversations))
    .filter((conversation: any) => `${conversation?.name ?? ""} ${conversation?.last_message_preview ?? ""}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  return NextResponse.json({
    people: (people ?? [])
      .filter((item) => !blockedIds.has(item.id))
      .map((item) => ({
        id: item.id,
        name: `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim() || item.username,
        username: item.username,
        avatarUrl: item.avatar_url,
        city: item.city,
      })),
    conversations: conversations.map((conversation: any) => ({
      id: conversation.id,
      type: conversation.type,
      name: conversation.name || "Bestehender Chat",
      preview: conversation.last_message_preview ?? "Unterhaltung oeffnen",
      lastMessageAt: conversation.last_message_at ?? null,
    })),
  });
}
