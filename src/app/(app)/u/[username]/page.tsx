import { notFound, redirect } from "next/navigation";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { getProfileView } from "@/features/profile/live-service";

export const dynamic = "force-dynamic";

type UserProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  const model = await getProfileView(username);

  if (!model) {
    if (!username) redirect("/login");
    notFound();
  }

  return <ProfilePageClient model={model} />;
}
