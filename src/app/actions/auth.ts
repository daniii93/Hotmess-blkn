"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  cookieStore.set("hotmess_demo_admin", "", {
    maxAge: 0,
    path: "/",
  });

  redirect("/login");
}
