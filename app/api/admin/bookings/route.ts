import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, addHoursToTime } from "@/lib/supabase";
import { pavilions } from "@/data/pavilions";
import { isAuthenticated } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "all";
  const pavilionId = searchParams.get("pavilionId");
  const date = searchParams.get("date");

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("pavilion_bookings")
    .select("*")
    .order("date", { ascending: false })
    .order("start_time", { ascending: true });

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (pavilionId) {
    query = query.eq("pavilion_id", pavilionId);
  }
  if (date) {
    query = query.eq("date", date);
  }

  const { data: bookings, error } = await query;

  if (error) {
    console.error("Admin bookings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }

  const all = bookings ?? [];

  const summary = {
    total: all.length,
    confirmed: all.filter((b) => b.status === "confirmed").length,
    cancelled: all.filter((b) => b.status === "cancelled").length,
    refunded: all.filter((b) => b.status === "refunded").length,
    revenueCents: all
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + (b.total_cents ?? 0), 0),
  };

  return NextResponse.json({ bookings: all, summary });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const { pavilionId, date, startTime, durationHours, guestName, guestEmail, guestPhone, notes, totalCents } = body;

  if (!pavilionId || !date || !startTime || !durationHours || !guestName) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const pavilion = pavilions.find((p) => p.id === pavilionId);
  if (!pavilion) {
    return NextResponse.json({ error: "Invalid pavilion." }, { status: 400 });
  }

  const dur = Number(durationHours);
  const endTime = addHoursToTime(startTime, dur);
  const now = new Date().toISOString();
  const reservationId = `ADMIN-${Date.now().toString(36).toUpperCase()}`;

  const supabase = getSupabaseAdmin();

  // Check for conflicts
  const { data: conflicts } = await supabase
    .from("pavilion_bookings")
    .select("id")
    .eq("pavilion_id", pavilionId)
    .eq("date", date)
    .not("status", "in", '("cancelled","refunded")')
    .lt("start_time", endTime)
    .gt("end_time", startTime);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: "Time slot conflicts with an existing booking." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("pavilion_bookings")
    .insert({
      reservation_id:    reservationId,
      pavilion_id:       pavilionId,
      pavilion_name:     pavilion.name,
      date,
      start_time:        startTime,
      end_time:          endTime,
      duration_hours:    dur,
      guest_name:        guestName,
      guest_email:       guestEmail || "",
      guest_phone:       guestPhone || null,
      total_cents:       Number(totalCents) || 0,
      status:            "confirmed",
      square_payment_id: null,
      notes:             notes || null,
      created_at:        now,
      updated_at:        now,
    })
    .select()
    .single();

  if (error) {
    console.error("Manual booking insert error:", error);
    return NextResponse.json(
      { error: `Failed to create booking: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, booking: data, reservationId });
}
