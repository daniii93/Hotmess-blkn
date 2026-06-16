import { redirect } from "next/navigation";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { getProfileView } from "@/features/profile/live-service";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const model = await getProfileView();

  if (!model) redirect("/login?returnTo=/profile");

  return <ProfilePageClient model={model} />;
}
