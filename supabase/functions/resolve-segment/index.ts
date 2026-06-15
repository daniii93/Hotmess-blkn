import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  admin_id: string;
  segment: {
    city?: string;
    gender?: string;
    verified?: boolean;
    dating?: boolean;
    business?: boolean;
    inactive_days?: number;
  };
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = client();
  if (!(await isAdmin(supabase, body.admin_id))) return json({ error: "Admin-Zugriff erforderlich." }, 403);

  let query = supabase.from("profiles").select("id", { count: "exact", head: true });
  if (body.segment.city) query = query.eq("city", body.segment.city);
  if (body.segment.gender) query = query.eq("gender", body.segment.gender);
  if (typeof body.segment.verified === "boolean") query = query.eq("verification_status", body.segment.verified ? "verified" : "unverified");
  if (typeof body.segment.dating === "boolean") query = query.eq("dating_enabled", body.segment.dating);
  if (typeof body.segment.business === "boolean") query = query.eq("business_enabled", body.segment.business);
  if (body.segment.inactive_days) {
    query = query.lt("last_active_at", new Date(Date.now() - body.segment.inactive_days * 24 * 60 * 60 * 1000).toISOString());
  }

  const { count, error } = await query;
  if (error) return json({ error: error.message }, 500);
  return json({ recipient_count: count ?? 0 });
});

function client() { return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""); }
async function isAdmin(supabase: ReturnType<typeof client>, adminId: string) { const { data } = await supabase.from("profiles").select("role").eq("id", adminId).maybeSingle(); return data?.role === "admin"; }
function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
