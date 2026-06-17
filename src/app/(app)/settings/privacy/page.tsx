import { redirect } from "next/navigation";
import { PrivacySettingsClient } from "@/components/settings/PrivacySettingsClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PrivacyRow = {
  is_private: boolean | null;
  show_followers: boolean | null;
  show_following: boolean | null;
  show_event_count: boolean | null;
  show_online_status: boolean | null;
  show_profile_visits: boolean | null;
};

export default async function PrivacySettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/settings/privacy");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_private,show_followers,show_following,show_event_count,show_online_status,show_profile_visits")
    .eq("id", user.id)
    .maybeSingle<PrivacyRow>();

  return (
    <PrivacySettingsClient
      initialValues={{
        isPrivate: profile?.is_private ?? true,
        showFollowers: profile?.show_followers ?? true,
        showFollowing: profile?.show_following ?? true,
        showEventCount: profile?.show_event_count ?? true,
        showOnlineStatus: profile?.show_online_status ?? true,
        showProfileVisits: profile?.show_profile_visits ?? true,
      }}
    />
  );
}
