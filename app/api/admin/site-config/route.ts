import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_config")
    .select("key, value, updated_at");

  if (error) {
    console.error("Admin site_config fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch site config." }, { status: 500 });
  }

  const result: Record<string, string | null> = {};
  for (const row of data ?? []) {
    result[row.key] = row.value;
  }
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const { key, value } = body as { key: string; value: string | null };

  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "Missing or invalid key." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_config")
    .upsert(
      { key, value: value ?? null, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )
    .select()
    .single();

  if (error) {
    console.error("Admin site_config upsert error:", error);
    return NextResponse.json({ error: "Failed to update site config." }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
