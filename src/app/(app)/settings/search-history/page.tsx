import { redirect } from "next/navigation";
import { SearchHistoryClient } from "@/components/settings/SearchHistoryClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SearchHistoryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnTo=/settings/search-history");

  return <SearchHistoryClient />;
}
