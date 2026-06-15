import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  user_id: string;
  item: "boost_1" | "boost_5" | "boost_10" | "superlike_5" | "superlike_25";
  quantity: number;
  price_cents: number;
  payment_id?: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { error } = await supabase.from("dating_consumable_purchases").insert(body);
  if (error) return json({ error: error.message }, 500);

  const column = body.item.startsWith("boost") ? "boosts_remaining" : "superlikes_remaining";
  const { data: profile } = await supabase.from("dating_profiles").select(column).eq("user_id", body.user_id).maybeSingle();
  const current = Number(profile?.[column] ?? 0);
  await supabase.from("dating_profiles").update({ [column]: current + body.quantity }).eq("user_id", body.user_id);

  return json({ purchased: true, item: body.item, quantity: body.quantity });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
