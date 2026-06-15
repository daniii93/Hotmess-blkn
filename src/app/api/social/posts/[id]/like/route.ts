import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

type LikeParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: LikeParams) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("likes").upsert({ post_id: id, user_id: profile.id }, { onConflict: "post_id,user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: post } = await supabase.from("posts").select("user_id,author_id").eq("id", id).maybeSingle();
  const ownerId = post?.user_id ?? post?.author_id;
  if (ownerId && ownerId !== profile.id) {
    await supabase.from("notification_bundles").upsert(
      {
        user_id: ownerId,
        bundle_key: `like:${id}`,
        category: "social",
        reference_id: id,
        actor_ids: [profile.id],
        count: 1,
        is_read: false,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "user_id,bundle_key" },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: LikeParams) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("likes").delete().eq("post_id", id).eq("user_id", profile.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
