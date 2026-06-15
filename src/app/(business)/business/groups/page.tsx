import { PageShell } from "@/components/shell/page-shell";
import { CreateGroup, GroupDetail, GroupList } from "@/components/business/business-sections";

export default function BusinessGroupsPage() {
  return (
    <>
      <PageShell pageKey="businessGroups" accent="business" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <GroupList />
        <div className="grid gap-5 lg:grid-cols-2">
          <GroupDetail />
          <CreateGroup />
        </div>
      </section>
    </>
  );
}
