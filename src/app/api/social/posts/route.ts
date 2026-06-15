import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const postSchema = z.object({
  content: z.string().max(2200).optional(),
  mediaUrl: z.string().url().optional(),
  eventId: z.string().uuid().optional(),
  locationLabel: z.string().max(120).optional(),
});

const extractHashtags = (content: string) =>
  Array.from(new Set((content.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((tag) => tag.slice(1).toLowerCase())));

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  if (profile.is_banned) return NextResponse.json({ error: "Konto gesperrt." }, { status: 403 });

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltiger Beitrag." }, { status: 400 });

  const content = parsed.data.content?.trim() ?? "";
  if (!content && !parsed.data.mediaUrl) return NextResponse.json({ error: "Text oder Medium fehlt." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: profile.id,
      author_id: profile.id,
      type: parsed.data.eventId ? "event" : parsed.data.mediaUrl ? "image" : "text",
      content,
      body: content,
      media_urls: parsed.data.mediaUrl ? [parsed.data.mediaUrl] : [],
      image_url: parsed.data.mediaUrl ?? null,
      event_id: parsed.data.eventId ?? null,
      hashtags: extractHashtags(content),
      location_label: parsed.data.locationLabel ?? profile.city ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("friend_activity").insert({
    actor_id: profile.id,
    user_id: profile.id,
    activity_type: "new_post",
    type: "new_post",
    reference_id: post.id,
    reference_type: "post",
    is_visible: true,
  });

  return NextResponse.json({ ok: true, postId: post.id });
}
