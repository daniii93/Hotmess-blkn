import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  code: z.string().min(4).max(80),
  bookingReference: z.string().max(120).optional(),
  commissionCents: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltiger Hotel-Code." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("mark_hotel_code_redeemed", {
    p_code: parsed.data.code,
    p_booking_reference: parsed.data.bookingReference ?? null,
    p_commission_cents: parsed.data.commissionCents ?? 0,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

