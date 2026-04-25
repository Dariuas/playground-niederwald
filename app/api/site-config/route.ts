import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_config")
      .select("key, value");

    if (error) {
      console.error("site_config fetch error:", error);
      return NextResponse.json({});
    }

    const result: Record<string, string | null> = {};
    for (const row of data ?? []) {
      result[row.key] = row.value;
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({});
  }
}
