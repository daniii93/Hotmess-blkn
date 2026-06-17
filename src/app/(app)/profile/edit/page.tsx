import { ProfileEditAuthGateway } from "@/components/profile/ProfileEditAuthGateway";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { getProfileView } from "@/features/profile/live-service";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const model = await getProfileView();

  if (!model) return <ProfileEditAuthGateway />;

  return <ProfileEditForm model={model} />;
}
