import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: "Onboarding konnte nicht gespeichert werden." }, { status: 500 });
  }

  await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      onboarding_completed: true,
    },
  });

  return NextResponse.json({ ok: true });
}
