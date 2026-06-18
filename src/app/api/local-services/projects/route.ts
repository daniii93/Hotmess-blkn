import { NextResponse } from "next/server";
import { z } from "zod";
import { createLocalServiceProject, getMyLocalServiceProjects } from "@/features/local-services/service";

const schema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(4000),
  desiredTimeline: z.string().max(120).nullable().optional(),
  budgetEuro: z.number().nullable().optional(),
  urgency: z.enum(["immediate", "this_week", "this_month", "flexible"]),
  address: z.string().max(200).nullable().optional(),
  zip: z.string().max(20).nullable().optional(),
  city: z.string().min(2).max(80),
  country: z.string().min(2).max(40),
  radiusKm: z.number().int().min(1).max(100).nullable().optional(),
  contactPreference: z.enum(["platform_chat", "phone_after_acceptance", "platform_visit"]),
});

export async function GET() {
  return NextResponse.json({ projects: await getMyLocalServiceProjects() });
}

export async function POST(request: Request) {
  try {
    const parsed = schema.parse(await request.json());
    const id = await createLocalServiceProject(parsed);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Auftrag konnte nicht erstellt werden." }, { status: 400 });
  }
}
