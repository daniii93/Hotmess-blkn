import { PageShell } from "@/components/shell/page-shell";
import { CreatePost, CreateStory } from "@/components/social/social-sections";

export default function CreatePage() {
  return (
    <>
      <PageShell pageKey="create" />
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-[0.65fr_0.35fr] lg:px-10">
        <CreatePost />
        <CreateStory />
      </section>
    </>
  );
}
