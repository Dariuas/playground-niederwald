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
      .select("pavilion_id, first_hour_price_cents, add_hour_price_cents, is_active, capacity, name_override, description_override, features_override, map_x, map_y");

    const configMap = new Map((configs ?? []).map((c) => [c.pavilion_id, c]));

    const result = pavilions.map((p) => {
      const db = configMap.get(p.id);
      return {
        id:                  p.id,
        name:                db?.name_override        ?? p.name,
        description:         db?.description_override ?? p.description,
        features:            (db?.features_override as string[] | null) ?? p.features,
        firstHourPrice:      (db?.first_hour_price_cents ?? DEFAULT_FIRST_HOUR) / 100,
        additionalHourPrice: (db?.add_hour_price_cents   ?? DEFAULT_ADD_HOUR)   / 100,
        isActive:            db?.is_active ?? true,
        capacity:            db?.capacity  ?? p.capacity,
        mapX:                db?.map_x     ?? null,
        mapY:                db?.map_y     ?? null,
      };
    });

    return NextResponse.json(result);
  } catch {
    // Fall back gracefully — static data will be used
    return NextResponse.json(
      pavilions.map((p) => ({
        id:                  p.id,
        name:                p.name,
        description:         p.description,
        features:            p.features,
        firstHourPrice:      p.firstHourPrice,
        additionalHourPrice: p.additionalHourPrice,
        isActive:            true,
        capacity:            p.capacity,
        mapX:                null,
        mapY:                null,
      }))
    );
  }
}
