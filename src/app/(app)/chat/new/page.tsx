import { ComposeSheet } from "@/components/inbox/ComposeSheet";

export const dynamic = "force-dynamic";

type NewChatPageProps = {
  searchParams: Promise<{ to?: string }>;
};

export default async function NewChatPage({ searchParams }: NewChatPageProps) {
  const params = await searchParams;
  return <ComposeSheet initialTo={params.to} />;
}
