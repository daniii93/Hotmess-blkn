import { FollowButton } from "@/components/profile/follow-button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { PokeButton, ReportDialog } from "@/components/social/social-sections";

export default function UserProfilePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <ProfileHeader name="HotMess Profil" username="mitglied" bio="Profilansicht mit Privacy-Matrix aus Teil 1." />
      <div className="mt-5">
        <div className="flex flex-wrap gap-3">
          <FollowButton state="none" />
          <PokeButton />
        </div>
      </div>
      <ProfileTabs />
      <div className="mt-6">
        <ReportDialog />
      </div>
    </main>
  );
}
