import { PageShell } from "@/components/shell/page-shell";
import { DatingProfileEditor } from "@/components/dating/dating-sections";

export default function DatingProfilePage() {
  return (
    <>
      <PageShell pageKey="datingProfile" accent="dating" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-10">
        <DatingProfileEditor />
      </section>
    </>
  );
}
