import { redirect } from "next/navigation";
import { SecuritySettingsClient } from "@/components/settings/SecuritySettingsClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SecuritySettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/settings/security");

  return <SecuritySettingsClient />;
}
