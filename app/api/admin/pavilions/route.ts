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
      name: dbRow?.name_override ?? p.name,
      capacity: dbRow?.capacity ?? p.capacity,
      firstHourPriceCents: dbRow?.first_hour_price_cents ?? DEFAULT_FIRST_HOUR,
      addHourPriceCents: dbRow?.add_hour_price_cents ?? DEFAULT_ADD_HOUR,
      isActive: dbRow?.is_active ?? true,
      updatedAt: dbRow?.updated_at ?? null,
      // Map/content overrides
      nameOverride: dbRow?.name_override ?? null,
      descriptionOverride: dbRow?.description_override ?? null,
      featuresOverride: dbRow?.features_override ?? null,
      mapX: dbRow?.map_x ?? null,
      mapY: dbRow?.map_y ?? null,
      // Static defaults (for display in admin)
      defaultName: p.name,
      defaultDescription: p.description,
      defaultFeatures: p.features,
      defaultMapX: p.x,
      defaultMapY: p.y,
    };
  });

  return NextResponse.json({ pavilions: merged });
}
