import { PageShell } from "@/components/shell/page-shell";
import { NotificationCenter } from "@/components/social/social-sections";
import { getNotifications } from "@/features/social/live-service";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <>
      <PageShell pageKey="notifications" emptyKey="notifications" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <NotificationCenter notifications={notifications} />
      </section>
    </>
  );
}
