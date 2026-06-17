import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const updateEventSchema = z.object({
  title: z.string().min(3).max(160),
  city: z.string().min(2).max(80),
  category: z.string().min(2).max(60),
  status: z.enum(["draft", "published", "sold_out", "completed", "cancelled"]),
  dateStart: z.string().min(1),
  doorsOpen: z.string().min(1).optional().nullable(),
  capacityTotal: z.coerce.number().int().min(2),
  venueName: z.string().min(2).max(160),
  address: z.string().max(240).optional().nullable(),
  femaleCapacity: z.coerce.number().int().min(0),
  maleCapacity: z.coerce.number().int().min(0),
  diverseCapacity: z.coerce.number().int().min(0).default(0),
  ticketPriceCents: z.coerce.number().int().min(0),
  reason: z.string().min(3).max(500).default("Event bearbeitet"),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const admin = await getRequestUserProfile(request);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Admin-Zugriff erforderlich." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = updateEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungueltige Event-Daten." }, { status: 400 });
  }

  const input = parsed.data;
  const capacitySum = input.femaleCapacity + input.maleCapacity + input.diverseCapacity;
  if (capacitySum !== input.capacityTotal) {
    return NextResponse.json({ error: "Gender-Kapazitaeten muessen die Gesamtkapazitaet ergeben." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: before, error: beforeError } = await supabase
    .from("events")
    .select("id,slug,title,city,category,status,date_start,starts_at,doors_open,capacity_total,venue_id,venues(name,address,city,country),event_gender_config(*),ticket_types(id,name,price_cents,quantity_total)")
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  if (beforeError) return NextResponse.json({ error: beforeError.message }, { status: 400 });
  if (!before) return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });

  const publishedAt = input.status === "published" && before.status !== "published" ? new Date().toISOString() : undefined;
  const { error: eventError } = await supabase
    .from("events")
    .update({
      title: input.title,
      city: input.city,
      category: input.category,
      status: input.status,
      published: input.status === "published" || input.status === "sold_out" || input.status === "completed",
      ...(publishedAt ? { published_at: publishedAt } : {}),
      date_start: input.dateStart,
      starts_at: input.dateStart,
      doors_open: input.doorsOpen || input.dateStart,
      capacity_total: input.capacityTotal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", before.id);

  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 400 });

  if (before.venue_id) {
    const { error: venueError } = await supabase
      .from("venues")
      .update({
        name: input.venueName,
        city: input.city,
        address: input.address || null,
        capacity: input.capacityTotal,
      })
      .eq("id", before.venue_id);
    if (venueError) return NextResponse.json({ error: venueError.message }, { status: 400 });
  }

  const { error: genderError } = await supabase
    .from("event_gender_config")
    .update({
      female_capacity: input.femaleCapacity,
      male_capacity: input.maleCapacity,
      diverse_capacity: input.diverseCapacity,
      capacity_female: input.femaleCapacity,
      capacity_male: input.maleCapacity,
      capacity_diverse: input.diverseCapacity,
      ratio_female: input.capacityTotal ? input.femaleCapacity / input.capacityTotal : 0,
      ratio_male: input.capacityTotal ? input.maleCapacity / input.capacityTotal : 0,
    })
    .eq("event_id", before.id);

  if (genderError) return NextResponse.json({ error: genderError.message }, { status: 400 });

  const firstTicket = Array.isArray(before.ticket_types) ? before.ticket_types[0] : null;
  if (firstTicket?.id) {
    const { error: ticketError } = await supabase
      .from("ticket_types")
      .update({
        price_cents: input.ticketPriceCents,
        quantity_total: input.capacityTotal,
        capacity: input.capacityTotal,
      })
      .eq("id", firstTicket.id);
    if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 400 });
  }

  const { data: after } = await supabase
    .from("events")
    .select("id,slug,title,city,category,status,date_start,starts_at,doors_open,capacity_total,venue_id,venues(name,address,city,country),event_gender_config(*),ticket_types(id,name,price_cents,quantity_total)")
    .eq("id", before.id)
    .maybeSingle();

  await supabase.from("admin_audit").insert({
    admin_id: admin.id,
    action: "update_event",
    target_type: "event",
    target_id: before.id,
    before_state: before,
    after_state: after,
    reason: input.reason,
  });

  return NextResponse.json({ ok: true, eventId: before.id });
}
