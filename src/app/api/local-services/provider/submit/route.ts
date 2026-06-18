import { NextResponse } from "next/server";
import { z } from "zod";
import { submitLocalServiceProvider } from "@/features/local-services/service";

const schema = z.object({
  categories: z.array(z.string().uuid()).min(1),
  description: z.string().min(20).max(1200),
  baseCity: z.string().min(2).max(80),
  baseZip: z.string().min(2).max(20),
  serviceRadiusKm: z.coerce.number().int().min(1).max(250),
  emergencyService: z.boolean().default(false),
  onsiteVisit: z.boolean().default(true),
  insuranceAvailable: z.boolean().default(false),
  minOrderEuro: z.number().nullable().optional(),
  hourlyRateEuro: z.number().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.parse(await request.json());
    const id = await submitLocalServiceProvider(parsed);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ungueltige Anbieter-Daten." }, { status: 400 });
  }
}
