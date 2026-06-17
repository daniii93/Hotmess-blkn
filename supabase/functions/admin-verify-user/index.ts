import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  admin_id: string;
  user_id: string;
  verification_status: "pending" | "verified" | "rejected" | "suspended";
  reason: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = client();
  if (!(await isAdmin(supabase, body.admin_id))) return json({ error: "Admin-Zugriff erforderlich." }, 403);

  const { data: before } = await supabase.from("profiles").select("id,verification_status").eq("id", body.user_id).maybeSingle();
  const { error } = await supabase.from("profiles").update({ verification_status: body.verification_status }).eq("id", body.user_id);
  if (error) return json({ error: error.message }, 500);

  await audit(supabase, body.admin_id, "verify", "user", body.user_id, before, { verification_status: body.verification_status }, body.reason);
  return json({ updated: true });
});

function client() {
  return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
}

async function isAdmin(supabase: ReturnType<typeof client>, adminId: string) {
  const { data } = await supabase.from("profiles").select("role").eq("id", adminId).maybeSingle();
  return data?.role === "admin";
}

async function audit(supabase: ReturnType<typeof client>, adminId: string, action: string, targetType: string, targetId: string, before: unknown, after: unknown, reason: string) {
  await supabase.rpc("log_admin_action", { p_admin_id: adminId, p_action: action, p_target_type: targetType, p_target_id: targetId, p_before_state: before, p_after_state: after, p_reason: reason });
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
