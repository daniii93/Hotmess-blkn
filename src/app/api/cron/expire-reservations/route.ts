import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const isAuthorized = (request: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
};

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const { data: expired, error: expiredError } = await supabase.rpc("expire_ticket_reservations");
  if (expiredError) return NextResponse.json({ error: expiredError.message }, { status: 400 });

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id")
    .in("status", ["published", "sold_out"]);

  if (eventsError) return NextResponse.json({ error: eventsError.message }, { status: 400 });

  const promoted = [];
  for (const event of events ?? []) {
    const { data, error } = await supabase.rpc("promote_waitlist_for_event", { p_event_id: event.id });
    if (!error) promoted.push(data);
  }

  return NextResponse.json({ ok: true, expired, promoted });
}

export const POST = GET;
