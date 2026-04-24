import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/adminAuth";
import { pavilions } from "@/data/pavilions";

function getDefaults() {
  return Object.fromEntries(
    pavilions.map((p) => [
      p.id,
      { firstHourCents: p.firstHourPrice * 100, addHourCents: p.additionalHourPrice * 100 },
    ])
  );
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();

  const { data: rows, error } = await supabase
    .from("pavilion_schedule")
    .select("pavilion_id, day_of_week, is_available, first_hour_price_cents, add_hour_price_cents");

  if (error) {
    // Table may not exist yet — return empty so admin page renders gracefully
    return NextResponse.json({ schedule: {}, defaults: getDefaults(), tableError: error.message });
  }

  const schedule: Record<string, Record<number, {
    isAvailable: boolean;
    firstHourCents: number | null;
    addHourCents: number | null;
  }>> = {};

  for (const row of rows ?? []) {
    if (!schedule[row.pavilion_id]) schedule[row.pavilion_id] = {};
    schedule[row.pavilion_id][row.day_of_week] = {
      isAvailable: row.is_available,
      firstHourCents: row.first_hour_price_cents,
      addHourCents: row.add_hour_price_cents,
    };
  }

  return NextResponse.json({ schedule, defaults: getDefaults() });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { updates } = await req.json() as {
    updates: Array<{
      pavilionId: string;
      dayOfWeek: number;
      isAvailable: boolean;
      firstHourCents: number | null;
      addHourCents: number | null;
    }>;
  };

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "No updates provided." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const rows = updates.map((u) => ({
    pavilion_id:            u.pavilionId,
    day_of_week:            u.dayOfWeek,
    is_available:           u.isAvailable,
    first_hour_price_cents: u.firstHourCents,
    add_hour_price_cents:   u.addHourCents,
    updated_at:             now,
  }));

  const { error } = await supabase
    .from("pavilion_schedule")
    .upsert(rows, { onConflict: "pavilion_id,day_of_week" });

  if (error) {
    console.error("Schedule upsert error:", error);
    return NextResponse.json({ error: `Failed to save: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
