import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/adminAuth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const {
    firstHourPriceCents,
    addHourPriceCents,
    isActive,
    capacity,
    nameOverride,
    descriptionOverride,
    featuresOverride,
    mapX,
    mapY,
  } = body as {
    firstHourPriceCents?: number;
    addHourPriceCents?: number;
    isActive?: boolean;
    capacity?: number;
    nameOverride?: string | null;
    descriptionOverride?: string | null;
    featuresOverride?: string[] | null;
    mapX?: number | null;
    mapY?: number | null;
  };

  const supabase = getSupabaseAdmin();

  // Build the upsert payload — always include pavilion_id and updated_at
  const upsertData: Record<string, unknown> = {
    pavilion_id: id,
    updated_at: new Date().toISOString(),
  };

  if (firstHourPriceCents !== undefined) {
    upsertData.first_hour_price_cents = firstHourPriceCents;
  }
  if (addHourPriceCents !== undefined) {
    upsertData.add_hour_price_cents = addHourPriceCents;
  }
  if (isActive !== undefined) {
    upsertData.is_active = isActive;
  }
  if (capacity !== undefined) {
    upsertData.capacity = capacity;
  }
  // Allow explicit null to clear overrides
  if ("nameOverride" in body) {
    upsertData.name_override = nameOverride ?? null;
  }
  if ("descriptionOverride" in body) {
    upsertData.description_override = descriptionOverride ?? null;
  }
  if ("featuresOverride" in body) {
    upsertData.features_override = featuresOverride ?? null;
  }
  if ("mapX" in body) {
    upsertData.map_x = mapX ?? null;
  }
  if ("mapY" in body) {
    upsertData.map_y = mapY ?? null;
  }

  const { data, error } = await supabase
    .from("pavilion_configs")
    .upsert(upsertData, { onConflict: "pavilion_id" })
    .select()
    .single();

  if (error) {
    console.error("Admin pavilion config upsert error:", error);
    return NextResponse.json({ error: "Failed to update pavilion config." }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}
