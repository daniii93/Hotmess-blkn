import { PageShell } from "@/components/shell/page-shell";
import { CoffeeChatList, CoffeeChatProposer } from "@/components/business/business-sections";

export default function BusinessCoffeePage() {
  return (
    <>
      <PageShell pageKey="businessCoffee" accent="business" />
      <section className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-6 lg:px-10">
        <CoffeeChatProposer />
        <CoffeeChatList />
      </section>
    </>
  );
}
