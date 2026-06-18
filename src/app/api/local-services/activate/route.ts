import { NextResponse } from "next/server";
import { getLocalServiceMe } from "@/features/local-services/service";

export async function POST() {
  const me = await getLocalServiceMe();
  if (!me) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  if (!me.verified) return NextResponse.json({ error: "Verifizierung erforderlich." }, { status: 403 });
  if (!me.businessProfile) return NextResponse.json({ next: "/business/profile", mode: "customer_or_provider" });
  if (me.businessProfile.verificationStatus !== "verified") return NextResponse.json({ next: "/business/profile", status: "business_pending" });
  if (!me.businessProfile.moduleActive) return NextResponse.json({ next: "/local-services/company/activate", status: "module_pending" });
  return NextResponse.json({ next: "/local-services/company/dashboard", status: "active" });
}
