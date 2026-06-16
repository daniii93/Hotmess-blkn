"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const remember = window.confirm("Login-Informationen speichern? Waehle OK fuer Speichern oder Abbrechen fuer Nicht jetzt.");
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    if (!remember) {
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ access_token: "", refresh_token: "" }),
      }).catch(() => null);
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <button className="w-full rounded-xl bg-hm-ink px-4 py-3 text-left text-sm font-bold text-hm-porcelain" type="button" onClick={logout}>
      Abmelden
    </button>
  );
}
