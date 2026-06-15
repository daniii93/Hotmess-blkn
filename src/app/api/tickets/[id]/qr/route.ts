import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

type TicketQrParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: TicketQrParams) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id,user_id,event_id,qr_token,status")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!ticket?.qr_token) return NextResponse.json({ error: "QR-Code nicht gefunden." }, { status: 404 });
  if (ticket.user_id !== profile.id && profile.role !== "admin" && profile.role !== "scanner") {
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  const png = await QRCode.toBuffer(ticket.qr_token, {
    width: 640,
    margin: 2,
    color: { dark: "#1C1915", light: "#FAF7F2" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "private, max-age=60",
    },
  });
}
