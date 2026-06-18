import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().default(""),
  icon: z.string().optional().default("circle"),
  minLeadPriceCents: z.number().int().min(0).default(500),
  maxLeadPriceCents: z.number().int().min(0).default(25000),
  commissionRate: z.number().min(0).max(50).default(8),
  requiredDocuments: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const { data, error } = await createSupabaseAdminClient().from("local_service_categories").insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      icon: input.icon,
      min_lead_price_cents: input.minLeadPriceCents,
      max_lead_price_cents: input.maxLeadPriceCents,
      commission_rate: input.commissionRate,
      required_documents: input.requiredDocuments,
      is_active: input.isActive,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kategorie konnte nicht erstellt werden." }, { status: 400 });
  }
}
