import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const followSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["follow", "unfollow", "cancel"]),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = followSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltige Anfrage." }, { status: 400 });

  const { userId, action } = parsed.data;
  if (userId === user.id) return NextResponse.json({ error: "Du kannst dir nicht selbst folgen." }, { status: 400 });

  if (action === "unfollow") {
    await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
    return NextResponse.json({ ok: true, state: "none" });
  }

  if (action === "cancel") {
    await supabase.from("follow_requests").delete().eq("from_user_id", user.id).eq("to_user_id", userId).eq("status", "pending");
    return NextResponse.json({ ok: true, state: "none" });
  }

  const { data: target, error: targetError } = await supabase.from("profiles").select("is_private").eq("id", userId).maybeSingle();
  if (targetError || !target) return NextResponse.json({ error: "Profil nicht gefunden." }, { status: 404 });

  if (target.is_private) {
    const { error } = await supabase
      .from("follow_requests")
      .upsert({ from_user_id: user.id, to_user_id: userId, status: "pending" }, { onConflict: "from_user_id,to_user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, state: "requested" });
  }

  const { error } = await supabase.from("follows").upsert({ follower_id: user.id, following_id: userId }, { onConflict: "follower_id,following_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, state: "following" });
}
