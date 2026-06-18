import { NextResponse } from "next/server";
import { updateLocalServiceOrderStatus } from "@/features/local-services/service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await updateLocalServiceOrderStatus(id, "completed_by_company");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Status konnte nicht geaendert werden." }, { status: 400 });
  }
}
