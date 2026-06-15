import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  admin_id: string;
  user_id: string;
  type: "warning" | "temp_ban" | "perm_ban" | "shadowban" | "feature_block";
  scope?: string;
  reason: string;
  expires_at?: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = client();
  if (!(await isAdmin(supabase, body.admin_id))) return json({ error: "Admin-Zugriff erforderlich." }, 403);

  const { data: before } = await supabase.from("profiles").select("id,is_banned,banned_reason").eq("id", body.user_id).maybeSingle();
  const { data: sanction, error } = await supabase.from("user_sanctions").insert({
    user_id: body.user_id,
    type: body.type,
    scope: body.scope ?? "all",
    reason: body.reason,
    issued_by: body.admin_id,
    expires_at: body.expires_at ?? null,
  }).select("id").single();
  if (error) return json({ error: error.message }, 500);

  if (body.type === "perm_ban" || body.type === "temp_ban") {
    await supabase.from("profiles").update({ is_banned: true, banned_reason: body.reason }).eq("id", body.user_id);
  }

  await audit(supabase, body.admin_id, "sanction_user", "user", body.user_id, before, { sanction_id: sanction.id, type: body.type }, body.reason);
  return json({ sanction_id: sanction.id });
});

function client() { return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""); }
async function isAdmin(supabase: ReturnType<typeof client>, adminId: string) { const { data } = await supabase.from("profiles").select("role").eq("id", adminId).maybeSingle(); return data?.role === "admin"; }
async function audit(supabase: ReturnType<typeof client>, adminId: string, action: string, targetType: string, targetId: string, before: unknown, after: unknown, reason: string) { await supabase.rpc("log_admin_action", { p_admin_id: adminId, p_action: action, p_target_type: targetType, p_target_id: targetId, p_before_state: before, p_after_state: after, p_reason: reason }); }
function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
