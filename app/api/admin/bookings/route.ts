import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

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
