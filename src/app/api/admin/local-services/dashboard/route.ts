import { NextResponse } from "next/server";
import { getLocalServicesAdminDashboard } from "@/features/local-services/service";

export async function GET() {
  return NextResponse.json(await getLocalServicesAdminDashboard());
}
