import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

const createEventSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  city: z.string().min(2),
  country: z.enum(["AT", "DE", "CH", "IT"]).default("AT"),
  venueName: z.string().min(2),
  address: z.string().optional(),
  category: z.string().min(2).default("club"),
  dateStart: z.string().min(1),
  doorsOpen: z.string().optional(),
  capacityTotal: z.coerce.number().int().min(2),
  femaleRatio: z.coerce.number().min(0).max(1).default(0.5),
  maleRatio: z.coerce.number().min(0).max(1).default(0.5),
  tolerance: z.coerce.number().int().min(0).default(0),
  ticketName: z.string().min(2).default("Regular"),
  ticketPriceCents: z.coerce.number().int().min(0),
  ticketQuantity: z.coerce.number().int().min(1).optional(),
  publish: z.boolean().default(true),
});

export async function POST(request: Request) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin-Zugriff erforderlich." }, { status: 403 });
  }

  const parsed = createEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungueltige Event-Daten." }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();
  const capacityFemale = Math.floor(input.capacityTotal * input.femaleRatio);
  const capacityMale = Math.floor(input.capacityTotal * input.maleRatio);
  const capacityDiverse = Math.max(0, input.capacityTotal - capacityFemale - capacityMale);

  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .insert({
      name: input.venueName,
      slug: input.slug,
      city: input.city,
      country: input.country,
      address: input.address || null,
      capacity: input.capacityTotal,
    })
    .select("id")
    .single();

  if (venueError) return NextResponse.json({ error: venueError.message }, { status: 400 });

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      venue_id: venue.id,
      title: input.title,
      slug: input.slug,
      city: input.city,
      category: input.category,
      starts_at: input.dateStart,
      date_start: input.dateStart,
      doors_open: input.doorsOpen || input.dateStart,
      hero_image_url: "/images/event-placeholder.jpg",
      cover_image_url: "/images/event-placeholder.jpg",
      preview_text: "HotMess Event",
      description: "Live aus Supabase verwaltetes HotMess Event.",
      published: input.publish,
      status: input.publish ? "published" : "draft",
      published_at: input.publish ? new Date().toISOString() : null,
      capacity_total: input.capacityTotal,
      created_by: profile.id,
    })
    .select("id,slug")
    .single();

  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 400 });

  const { error: genderError } = await supabase.from("event_gender_config").insert({
    event_id: event.id,
    female_capacity: capacityFemale,
    male_capacity: capacityMale,
    diverse_capacity: capacityDiverse,
    capacity_female: capacityFemale,
    capacity_male: capacityMale,
    capacity_diverse: capacityDiverse,
    ratio_female: input.femaleRatio,
    ratio_male: input.maleRatio,
    tolerance: input.tolerance,
  });

  if (genderError) return NextResponse.json({ error: genderError.message }, { status: 400 });

  const { error: ticketError } = await supabase.from("ticket_types").insert({
    event_id: event.id,
    name: input.ticketName,
    price_cents: input.ticketPriceCents,
    currency: "EUR",
    capacity: input.ticketQuantity ?? input.capacityTotal,
    quantity_total: input.ticketQuantity ?? input.capacityTotal,
    active: true,
    is_active: true,
  });

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 400 });

  return NextResponse.json({ ok: true, slug: event.slug, id: event.id });
}
