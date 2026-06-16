import { ProfileAuthGateway } from "@/components/profile/ProfileAuthGateway";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { getProfileView } from "@/features/profile/live-service";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const model = await getProfileView();

  if (!model) return <ProfileAuthGateway />;

  return <ProfilePageClient model={model} />;
}
