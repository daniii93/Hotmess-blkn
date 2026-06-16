import { NextResponse } from "next/server";
import { getInboxData } from "@/features/inbox/live-service";

export async function GET() {
  const data = await getInboxData();
  if (!data) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  return NextResponse.json(data);
}
