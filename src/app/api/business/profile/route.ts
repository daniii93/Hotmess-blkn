import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUserProfile } from "@/features/events/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  careerStatus: z.enum(["employed", "self_employed", "founder", "freelancer", "student", "job_seeking", "investor", "executive"]),
  headline: z.string().min(3).max(120),
  company: z.string().max(120).optional().default(""),
  position: z.string().max(120).optional().default(""),
  industry: z.string().min(2).max(80),
  experienceYears: z.coerce.number().int().min(0).max(60).optional().default(0),
  bio: z.string().max(600).optional().default(""),
  skills: z.array(z.string().min(1).max(40)).max(20).optional().default([]),
  languages: z.array(z.string().min(1).max(20)).max(10).optional().default([]),
  websiteUrl: z.string().url().optional().or(z.literal("")).default(""),
  linkedinUrl: z.string().url().optional().or(z.literal("")).default(""),
  lookingFor: z.array(z.string().min(1).max(40)).min(1).max(12),
  offering: z.array(z.string().min(1).max(40)).max(12).optional().default([]),
  openToWork: z.boolean().optional().default(false),
  openToHire: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  if (profile.is_banned) return NextResponse.json({ error: "Dieses Konto ist gesperrt." }, { status: 403 });
  if (profile.verification_status !== "verified") return NextResponse.json({ error: "Business ist nur fuer verifizierte Nutzer moeglich." }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Business-Profil ist ungueltig." }, { status: 400 });
  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { error: flagError } = await supabase.from("profiles").update({ business_enabled: true }).eq("id", profile.id);
  if (flagError) return NextResponse.json({ error: flagError.message }, { status: 400 });

  const { error } = await supabase.from("business_profiles").upsert(
    {
      user_id: profile.id,
      is_active: input.isActive,
      career_status: input.careerStatus,
      headline: input.headline,
      company: input.company || null,
      position: input.position || null,
      role_title: input.position || null,
      industry: input.industry,
      experience_years: input.experienceYears,
      bio: input.bio,
      photo_url: profile.avatar_url,
      skills: input.skills,
      languages: input.languages,
      website_url: input.websiteUrl || null,
      linkedin_url: input.linkedinUrl || null,
      looking_for_tags: input.lookingFor,
      offering_tags: input.offering,
      looking_for: input.lookingFor.join(", "),
      offering: input.offering.join(", "),
      open_to_work: input.openToWork,
      open_to_hire: input.openToHire,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
