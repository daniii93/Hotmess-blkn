import { NextResponse } from "next/server";
import { getLocalServiceCategories } from "@/features/local-services/service";

export async function GET() {
  return NextResponse.json({ categories: await getLocalServiceCategories() });
}
