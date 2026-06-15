import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  admin_id: string;
  order_id: string;
  reason: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = client();
  if (!(await isAdmin(supabase, body.admin_id))) return json({ error: "Admin-Zugriff erforderlich." }, 403);

  const { data: before } = await supabase.from("orders").select("*").eq("id", body.order_id).maybeSingle();
  if (!before) return json({ error: "Bestellung wurde nicht gefunden." }, 404);

  await supabase.from("orders").update({ status: "refunded" }).eq("id", body.order_id);
  await supabase.from("tickets").update({ status: "cancelled" }).eq("order_id", body.order_id);
  await audit(supabase, body.admin_id, "refund", "order", body.order_id, before, { status: "refunded", provider_refund: "prepared" }, body.reason);
  return json({ refunded: "prepared", order_id: body.order_id });
});

function client() { return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""); }
async function isAdmin(supabase: ReturnType<typeof client>, adminId: string) { const { data } = await supabase.from("profiles").select("role").eq("id", adminId).maybeSingle(); return data?.role === "admin"; }
async function audit(supabase: ReturnType<typeof client>, adminId: string, action: string, targetType: string, targetId: string, before: unknown, after: unknown, reason: string) { await supabase.rpc("log_admin_action", { p_admin_id: adminId, p_action: action, p_target_type: targetType, p_target_id: targetId, p_before_state: before, p_after_state: after, p_reason: reason }); }
function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
