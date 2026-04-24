import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { firstHourPriceCents, addHourPriceCents, isActive, capacity } = body as {
    firstHourPriceCents?: number;
    addHourPriceCents?: number;
    isActive?: boolean;
    capacity?: number;
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
