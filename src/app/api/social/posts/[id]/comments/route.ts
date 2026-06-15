import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
});

type CommentParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: CommentParams) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = commentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Kommentar ungueltig." }, { status: 400 });

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      post_id: id,
      user_id: profile.id,
      author_id: profile.id,
      content: parsed.data.content,
      body: parsed.data.content,
      parent_id: parsed.data.parentId ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: post } = await supabase.from("posts").select("user_id,author_id").eq("id", id).maybeSingle();
  const ownerId = post?.user_id ?? post?.author_id;
  if (ownerId && ownerId !== profile.id) {
    await supabase.from("notifications").insert({
      user_id: ownerId,
      actor_id: profile.id,
      type: "comment",
      category: "social",
      title: "Neuer Kommentar",
      body: parsed.data.content,
      reference_id: id,
      reference_type: "post",
    });
  }

  return NextResponse.json({ ok: true, commentId: comment.id });
}
