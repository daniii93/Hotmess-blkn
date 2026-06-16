import { redirect } from "next/navigation";
import { MessagePrivacyClient } from "@/components/settings/MessagePrivacyClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MessageSetting = "everyone" | "followers" | "off";
type GroupSetting = "everyone" | "followers";

export default async function MessageSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/settings/messages");

  const { data: profile } = await supabase
    .from("profiles")
    .select("who_can_message,who_can_add_to_groups")
    .eq("id", user.id)
    .maybeSingle<{ who_can_message: MessageSetting | null; who_can_add_to_groups: GroupSetting | null }>();

  return (
    <MessagePrivacyClient
      initialWhoCanMessage={profile?.who_can_message ?? "everyone"}
      initialWhoCanAddToGroups={profile?.who_can_add_to_groups ?? "followers"}
    />
  );
}
