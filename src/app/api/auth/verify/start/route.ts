import { NextResponse } from "next/server";
import { getPublicEnv, getServerEnv } from "@/config/env";
import { createStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  }

  const stripeSecret = getServerEnv().stripeSecretKey;
  if (!stripeSecret || !stripeSecret.startsWith("sk_")) {
    return NextResponse.json({
      error: "Stripe Identity ist noch nicht fertig konfiguriert. Bitte STRIPE_SECRET_KEY in Vercel setzen.",
    }, { status: 501 });
  }

  try {
    const appUrl = getPublicEnv().appUrl || "https://www.hotmess-blkn.app";
    const stripe = createStripeServerClient();
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { user_id: user.id },
      return_url: `${appUrl}/verify?identity=returned`,
    } as any);

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({
        verification_status: "pending",
        stripe_identity_session_id: session.id,
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      status: "pending",
      url: (session as any).url ?? null,
      clientSecret: session.client_secret ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe Identity konnte nicht gestartet werden.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
