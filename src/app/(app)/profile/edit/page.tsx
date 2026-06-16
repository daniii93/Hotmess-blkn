import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { getProfileView } from "@/features/profile/live-service";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const model = await getProfileView();

  if (!model) redirect("/login?returnTo=/profile/edit");

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
      <ProfileEditForm model={model} />
    </main>
  );
}
