import { NextResponse } from "next/server";
import { acceptLocalServiceOffer } from "@/features/local-services/service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orderId = await acceptLocalServiceOffer(id);
    return NextResponse.json({ ok: true, orderId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Angebot konnte nicht angenommen werden." }, { status: 400 });
  }
}
