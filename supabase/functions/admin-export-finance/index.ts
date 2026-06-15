import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  admin_id: string;
  from: string;
  to: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data: admin } = await supabase.from("profiles").select("role").eq("id", body.admin_id).maybeSingle();
  if (admin?.role !== "admin") return json({ error: "Admin-Zugriff erforderlich." }, 403);

  const { data, error } = await supabase
    .from("orders")
    .select("id,created_at,status,total_cents,amount_cents,currency,payment_method,provider")
    .gte("created_at", body.from)
    .lte("created_at", body.to)
    .order("created_at", { ascending: true });
  if (error) return json({ error: error.message }, 500);

  const csv = ["id,created_at,status,amount_cents,currency,provider"]
    .concat((data ?? []).map((order) => `${order.id},${order.created_at},${order.status},${order.total_cents ?? order.amount_cents ?? 0},${order.currency ?? "EUR"},${order.payment_method ?? order.provider ?? ""}`))
    .join("\n");

  await supabase.rpc("log_admin_action", { p_admin_id: body.admin_id, p_action: "finance_export", p_target_type: "finance", p_target_id: null, p_before_state: null, p_after_state: { from: body.from, to: body.to, rows: data?.length ?? 0 }, p_reason: "Finanzexport" });
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8" } });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
