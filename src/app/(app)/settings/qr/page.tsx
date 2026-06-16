import { redirect } from "next/navigation";
import { ProfileQrClient } from "@/components/settings/ProfileQrClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type QrColor = "gold" | "ink" | "champagne";

export default async function ProfileQrPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/settings/qr");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username,qr_color")
    .eq("id", user.id)
    .maybeSingle<{ username: string; qr_color: QrColor | null }>();

  if (!profile) redirect("/profile");

  return <ProfileQrClient username={profile.username} initialColor={profile.qr_color ?? "gold"} />;
}
