import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, addHoursToTime } from "@/lib/supabase";

/**
 * GET /api/availability?pavilionId=X&date=YYYY-MM-DD&startTime=HH:MM&duration=N
 *
 * Returns whether the requested slot is available and all booked slots for the day,
 * so the UI can show which hours are blocked.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pavilionId = searchParams.get("pavilionId");
  const date       = searchParams.get("date");
  const startTime  = searchParams.get("startTime");
  const durationRaw = searchParams.get("duration");

  if (!pavilionId || !date) {
    return NextResponse.json({ error: "Missing pavilionId or date." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch all active bookings for this pavilion on this date
  const { data: bookings, error } = await supabase
    .from("pavilion_bookings")
    .select("start_time, end_time, duration_hours")
    .eq("pavilion_id", pavilionId)
    .eq("date", date)
    .not("status", "in", '("cancelled","refunded")');

  if (error) {
    console.error("Availability query failed:", error);
    return NextResponse.json({ error: "Could not check availability." }, { status: 500 });
  }

  const bookedSlots = (bookings ?? []).map((b) => ({
    start: b.start_time.substring(0, 5), // trim seconds
    end:   b.end_time.substring(0, 5),
  }));

  // If start time + duration provided, check if that specific slot is free
  let available: boolean | null = null;
  let message = "";

  if (startTime && durationRaw) {
    const duration = parseInt(durationRaw, 10);
    const endTime  = addHoursToTime(startTime, duration);

    const hasConflict = bookedSlots.some(
      (slot) => startTime < slot.end && endTime > slot.start
    );

    available = !hasConflict;
    if (hasConflict) {
      message = "This time slot is already booked. Please choose a different time.";
    }
  }

  return NextResponse.json({ date, pavilionId, available, message, bookedSlots });
}
