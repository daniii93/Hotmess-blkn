import { redirect } from "next/navigation";
import { NotificationSettingsClient } from "@/components/settings/NotificationSettingsClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type NotificationRow = {
  likes: boolean | null;
  comments: boolean | null;
  follows: boolean | null;
  follow_requests: boolean | null;
  chat: boolean | null;
  event_updates: boolean | null;
  email_enabled: boolean | null;
  push_enabled: boolean | null;
};

export default async function NotificationSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/settings/notifications");

  const { data: settings } = await supabase
    .from("notification_settings")
    .select("likes,comments,follows,follow_requests,chat,event_updates,email_enabled,push_enabled")
    .eq("user_id", user.id)
    .maybeSingle<NotificationRow>();

  return (
    <NotificationSettingsClient
      initialValues={{
        likes: settings?.likes ?? true,
        comments: settings?.comments ?? true,
        follows: settings?.follows ?? true,
        followRequests: settings?.follow_requests ?? true,
        chat: settings?.chat ?? true,
        eventUpdates: settings?.event_updates ?? true,
        emailEnabled: settings?.email_enabled ?? true,
        pushEnabled: settings?.push_enabled ?? true,
      }}
    />
  );
}
