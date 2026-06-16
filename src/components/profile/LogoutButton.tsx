"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <button className="w-full rounded-xl bg-hm-ink px-4 py-3 text-left text-sm font-bold text-hm-porcelain" type="button" onClick={logout}>
      Abmelden
    </button>
  );
}
