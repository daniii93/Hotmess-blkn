import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const notificationSettingsSchema = z.object({
  likes: z.boolean().optional(),
  comments: z.boolean().optional(),
  follows: z.boolean().optional(),
  followRequests: z.boolean().optional(),
  chat: z.boolean().optional(),
  eventUpdates: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = notificationSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltige Benachrichtigungsdaten." }, { status: 400 });

  const input = parsed.data;
  const update: Record<string, unknown> = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (input.likes !== undefined) update.likes = input.likes;
  if (input.comments !== undefined) update.comments = input.comments;
  if (input.follows !== undefined) update.follows = input.follows;
  if (input.followRequests !== undefined) update.follow_requests = input.followRequests;
  if (input.chat !== undefined) update.chat = input.chat;
  if (input.eventUpdates !== undefined) update.event_updates = input.eventUpdates;
  if (input.emailEnabled !== undefined) update.email_enabled = input.emailEnabled;
  if (input.pushEnabled !== undefined) update.push_enabled = input.pushEnabled;

  const { error } = await supabase.from("notification_settings").upsert(update, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
