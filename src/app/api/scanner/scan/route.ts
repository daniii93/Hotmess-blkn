import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const scanSchema = z.object({
  qrToken: z.string().min(10),
  gate: z.string().default("Haupteingang"),
});

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile || (profile.role !== "admin" && profile.role !== "scanner")) {
    return NextResponse.json({ error: "Scanner-Zugriff erforderlich." }, { status: 403 });
  }

  const parsed = scanSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "QR-Code fehlt." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id,status,event_id,user_id,holder_name,holder_gender,holder_photo_url,has_fastlane,scanned_at,ticket_types(name),events(title)")
    .eq("qr_token", parsed.data.qrToken)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!ticket) return NextResponse.json({ error: "Ungueltiges Ticket." }, { status: 404 });
  if (ticket.status === "used") return NextResponse.json({ error: `Bereits eingelassen: ${ticket.scanned_at}` }, { status: 409 });
  if (ticket.status !== "valid") return NextResponse.json({ error: "Ticket ist nicht gueltig." }, { status: 409 });

  const { error: updateError } = await supabase
    .from("tickets")
    .update({
      status: "used",
      scanned_at: new Date().toISOString(),
      scanned_by: profile.id,
      scan_gate: parsed.data.gate,
    })
    .eq("id", ticket.id)
    .eq("status", "valid");

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({ ok: true, ticket });
}
