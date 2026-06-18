import { NextResponse } from "next/server";
import { purchaseLocalServiceLead } from "@/features/local-services/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await purchaseLocalServiceLead(id, request);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Lead konnte nicht gekauft werden." }, { status: 400 });
  }
}
