import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type NotificationBody = {
  user_id: string;
  type: string;
  category: "social" | "chat" | "event" | "ticket" | "dating" | "business" | "system";
  title: string;
  body?: string;
  actor_id?: string;
  reference_id?: string;
  reference_type?: string;
  bundle_key?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const payload = (await request.json()) as NotificationBody;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  if (payload.bundle_key) {
    const { data: bundle } = await supabase
      .from("notification_bundles")
      .select("id,count,actor_ids")
      .eq("user_id", payload.user_id)
      .eq("bundle_key", payload.bundle_key)
      .maybeSingle();

    if (bundle) {
      const actorIds = Array.from(new Set([...(bundle.actor_ids ?? []), payload.actor_id].filter(Boolean)));
      await supabase
        .from("notification_bundles")
        .update({ count: bundle.count + 1, actor_ids: actorIds, last_updated: new Date().toISOString() })
        .eq("id", bundle.id);
      return json({ bundled: true, bundle_id: bundle.id });
    }

    await supabase.from("notification_bundles").insert({
      user_id: payload.user_id,
      bundle_key: payload.bundle_key,
      category: payload.category,
      reference_id: payload.reference_id ?? null,
      actor_ids: payload.actor_id ? [payload.actor_id] : [],
    });
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: payload.user_id,
      type: payload.type,
      category: payload.category,
      actor_id: payload.actor_id ?? null,
      title: payload.title,
      body: payload.body ?? "",
      reference_id: payload.reference_id ?? null,
      reference_type: payload.reference_type ?? null,
    })
    .select("id")
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ notification_id: data.id, push: "prepared", email: "prepared" });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
