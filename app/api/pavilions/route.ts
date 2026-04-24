import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { pavilions } from "@/data/pavilions";

const DEFAULT_FIRST_HOUR = 3500;
const DEFAULT_ADD_HOUR   = 1500;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: configs } = await supabase
      .from("pavilion_configs")
      .select("pavilion_id, first_hour_price_cents, add_hour_price_cents, is_active, capacity");

    const configMap = new Map((configs ?? []).map((c) => [c.pavilion_id, c]));

    const result = pavilions.map((p) => {
      const db = configMap.get(p.id);
      return {
        id: p.id,
        firstHourPrice:      (db?.first_hour_price_cents ?? DEFAULT_FIRST_HOUR) / 100,
        additionalHourPrice: (db?.add_hour_price_cents   ?? DEFAULT_ADD_HOUR)   / 100,
        isActive:            db?.is_active ?? true,
        capacity:            db?.capacity  ?? p.capacity,
      };
    });

    return NextResponse.json(result);
  } catch {
    // Fall back gracefully — static prices will be used
    return NextResponse.json(
      pavilions.map((p) => ({
        id: p.id,
        firstHourPrice:      p.firstHourPrice,
        additionalHourPrice: p.additionalHourPrice,
        isActive:            true,
      }))
    );
  }
}
