import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  admin_id: string;
  broadcast_id: string;
  reason: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = client();
  if (!(await isAdmin(supabase, body.admin_id))) return json({ error: "Admin-Zugriff erforderlich." }, 403);

  const { data: broadcast } = await supabase.from("broadcasts").select("*").eq("id", body.broadcast_id).maybeSingle();
  if (!broadcast) return json({ error: "Broadcast wurde nicht gefunden." }, 404);

  const { data: recipients } = await supabase.from("profiles").select("id").limit(1000);
  const rows = (recipients ?? []).map((recipient) => ({
    user_id: recipient.id,
    type: "broadcast",
    category: "system",
    title: broadcast.title,
    body: broadcast.body,
    reference_id: broadcast.id,
    reference_type: "broadcast",
  }));
  if (rows.length > 0) await supabase.from("notifications").insert(rows);

  await supabase.from("broadcasts").update({ status: "sent", sent_count: rows.length, sent_at: new Date().toISOString() }).eq("id", body.broadcast_id);
  await supabase.rpc("log_admin_action", { p_admin_id: body.admin_id, p_action: "broadcast_send", p_target_type: "broadcast", p_target_id: body.broadcast_id, p_before_state: broadcast, p_after_state: { sent_count: rows.length }, p_reason: body.reason });
  return json({ sent_count: rows.length, provider: "prepared" });
});

function client() { return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""); }
async function isAdmin(supabase: ReturnType<typeof client>, adminId: string) { const { data } = await supabase.from("profiles").select("role").eq("id", adminId).maybeSingle(); return data?.role === "admin"; }
function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
