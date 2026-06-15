import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

serve(async (request) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2025-02-24.acacia" });
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  if (request.headers.get("stripe-signature")) {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") ?? "";
    const secret = Deno.env.get("STRIPE_IDENTITY_WEBHOOK_SECRET") ?? "";
    const event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const status = event.type === "identity.verification_session.verified" ? "verified" : "rejected";

    await supabase
      .from("profiles")
      .update({ verification_status: status, stripe_identity_session_id: session.id })
      .eq("stripe_identity_session_id", session.id);

    return Response.json({ received: true });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);

  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const session = await stripe.identity.verificationSessions.create({
    type: "document",
    metadata: { user_id: user.id },
  });

  await supabase
    .from("profiles")
    .update({ verification_status: "pending", stripe_identity_session_id: session.id })
    .eq("id", user.id);

  return Response.json({ client_secret: session.client_secret });
});
