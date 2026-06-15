import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ScanBody = {
  qr_token: string;
  event_id: string;
  scanner_user_id: string;
  confirm?: boolean;
  gate?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = (await request.json()) as ScanBody;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: access } = await supabase
    .from("scanner_access")
    .select("id")
    .eq("event_id", body.event_id)
    .eq("scanner_user_id", body.scanner_user_id)
    .gt("valid_until", new Date().toISOString())
    .maybeSingle();

  if (!access) return json({ result: "forbidden", message: "Kein Scanner-Zugriff für dieses Event." }, 403);

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id,event_id,status,holder_name,holder_gender,holder_photo_url,has_fastlane,scanned_at")
    .eq("qr_token", body.qr_token)
    .maybeSingle();

  if (error || !ticket) return json({ result: "invalid", message: "Ungültiges Ticket." }, 404);
  if (ticket.event_id !== body.event_id) return json({ result: "wrong_event", message: "Ticket gehört zu einem anderen Event." }, 409);
  if (ticket.status === "used") return json({ result: "used", message: "Ticket wurde bereits eingelassen.", ticket }, 409);
  if (ticket.status !== "valid") return json({ result: "not_valid", message: "Ticket ist nicht gültig.", ticket }, 409);

  if (!body.confirm) return json({ result: "ready", ticket });

  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      status: "used",
      scanned_at: new Date().toISOString(),
      scanned_by: body.scanner_user_id,
      scan_gate: body.gate ?? "Haupteingang",
    })
    .eq("id", ticket.id)
    .eq("status", "valid");

  if (updateError) return json({ result: "failed", message: updateError.message }, 500);
  return json({ result: "admitted", ticket_id: ticket.id });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
