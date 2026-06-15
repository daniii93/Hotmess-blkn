import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ReserveTicketBody = {
  event_id: string;
  ticket_type_id: string;
  user_id: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const body = (await request.json()) as ReserveTicketBody;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, gender, avatar_url, verification_status, is_banned")
    .eq("id", body.user_id)
    .single();

  if (profileError || !profile) return json({ error: "Profil wurde nicht gefunden." }, 404);
  if (profile.is_banned) return json({ error: "Dieses Konto ist gesperrt." }, 403);
  if (profile.verification_status !== "verified") return json({ error: "Bitte verifiziere dich vor dem Ticketkauf." }, 403);

  const { data: existingTicket } = await supabase
    .from("tickets")
    .select("id")
    .eq("event_id", body.event_id)
    .eq("user_id", body.user_id)
    .in("status", ["reserved", "paid", "valid"])
    .maybeSingle();

  if (existingTicket) return json({ error: "Du hast bereits ein Ticket für dieses Event." }, 409);

  const { data: result, error } = await supabase.rpc("reserve_ticket_transaction", {
    p_event_id: body.event_id,
    p_ticket_type_id: body.ticket_type_id,
    p_user_id: body.user_id,
    p_gender: profile.gender,
    p_holder_name: `${profile.first_name} ${profile.last_name}`.trim(),
    p_holder_photo_url: profile.avatar_url,
  });

  if (error) {
    return json(
      {
        error: "Die atomare Reservierungsfunktion ist noch nicht in der Datenbank installiert.",
        details: error.message,
      },
      501,
    );
  }

  return json(result);
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
