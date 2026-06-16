import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");
const makeCode = () => `${randomBytes(3).toString("hex").toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const { data } = await supabase
    .from("two_factor_backup_codes")
    .select("id,used,used_at,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ codes: data ?? [] });
}

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const codes = Array.from({ length: 10 }, makeCode);
  const admin = createSupabaseAdminClient();

  await admin.from("two_factor_backup_codes").delete().eq("user_id", user.id);
  const { error } = await admin.from("two_factor_backup_codes").insert(
    codes.map((code) => ({
      user_id: user.id,
      code_hash: hashCode(code),
    })),
  );

  if (error) return NextResponse.json({ error: "Backup-Codes konnten nicht erstellt werden." }, { status: 500 });

  await admin.from("account_audit").insert({
    user_id: user.id,
    action: "backup_codes_generated",
    detail: { count: codes.length },
  });

  return NextResponse.json({ codes });
}
