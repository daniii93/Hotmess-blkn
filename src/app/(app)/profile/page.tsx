import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { ProfileVisitsList } from "@/components/profile/profile-visits-list";

export default function ProfilePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <ProfileHeader name="HotMess Mitglied" username="hotmess" bio="Dein Profil wird nach dem Onboarding mit Foto, Musik, Badges und Events gefuellt." />
      <section className="mt-6">
        <ProfileVisitsList />
      </section>
      <ProfileTabs />
    </main>
  );
}
