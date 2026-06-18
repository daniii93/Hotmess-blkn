import { NextResponse } from "next/server";
import { z } from "zod";
import { filterProtectedContactText } from "@/features/local-services/contact-filter";
import { createLocalServiceOffer } from "@/features/local-services/service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

const schema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(3).max(140),
  description: z.string().min(20).max(4000),
  laborEuro: z.number().nullable().optional(),
  materialEuro: z.number().nullable().optional(),
  otherEuro: z.number().nullable().optional(),
  taxEuro: z.number().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  durationDays: z.number().int().nullable().optional(),
  paymentTerms: z.string().max(400).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.parse(await request.json());
    const filter = filterProtectedContactText(`${parsed.title}\n${parsed.description}\n${parsed.paymentTerms ?? ""}`);
    if (filter.blocked) {
      const profile = await getCurrentUserProfile();
      await createSupabaseAdminClient().from("local_service_contact_violations").insert({
        user_id: profile?.id ?? null,
        project_id: parsed.projectId,
        surface: "offer",
        blocked_text: filter.sanitizedText,
        reason: filter.reasons.join(", "),
      });
      return NextResponse.json({ error: "Aus Sicherheitsgruenden bleiben Kontaktdaten bis zur Auftragsbestaetigung geschuetzt. Bitte nutze den HotMess-Chat." }, { status: 400 });
    }
    const id = await createLocalServiceOffer(parsed);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Angebot konnte nicht erstellt werden." }, { status: 400 });
  }
}
