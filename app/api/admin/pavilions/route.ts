import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/adminAuth";
import { pavilions } from "@/data/pavilions";

const DEFAULT_FIRST_HOUR = 3500;
const DEFAULT_ADD_HOUR = 1500;

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();

  const { data: configs, error } = await supabase
    .from("pavilion_configs")
    .select("*");

  if (error) {
    console.error("Admin pavilion configs fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch pavilion configs." }, { status: 500 });
  }

  const configMap = new Map(
    (configs ?? []).map((c) => [c.pavilion_id, c])
  );

  const merged = pavilions.map((p) => {
    const dbRow = configMap.get(p.id);
    return {
      pavilionId: p.id,
      name: p.name,
      capacity: p.capacity,
      firstHourPriceCents: dbRow?.first_hour_price_cents ?? DEFAULT_FIRST_HOUR,
      addHourPriceCents: dbRow?.add_hour_price_cents ?? DEFAULT_ADD_HOUR,
      isActive: dbRow?.is_active ?? true,
      updatedAt: dbRow?.updated_at ?? null,
    };
  });

  return NextResponse.json({ pavilions: merged });
}
