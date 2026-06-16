import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/features/events/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Props) {
  const admin = await getCurrentUserProfile();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Admin-Zugriff erforderlich." }, { status: 403 });

  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const event =
    (await supabase.from("events").select("id").eq("id", id).maybeSingle()).data ??
    (await supabase.from("events").select("id").eq("slug", id).maybeSingle()).data;

  if (!event) return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });

  const { data, error } = await supabase.rpc("recalculate_event_settlement", { p_event_id: event.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("admin_audit").insert({
    admin_id: admin.id,
    action: "recalculate_event_settlement",
    target_type: "event",
    target_id: event.id,
    after_state: data,
    reason: "Teil 3b Settlement neu berechnet",
  });

  return NextResponse.json(data);
}

