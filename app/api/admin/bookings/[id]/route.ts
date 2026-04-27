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
  const { status, notes } = body as {
    status?: "cancelled" | "refunded";
    notes?: string;
  };

  if (!status || !["cancelled", "refunded"].includes(status)) {
    return NextResponse.json(
      { error: "status must be 'cancelled' or 'refunded'." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Look up booking to get Square payment details for refunds
  const { data: existing, error: fetchErr } = await supabase
    .from("pavilion_bookings")
    .select("id, status, square_payment_id, total_cents")
    .eq("id", id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  // If transitioning to refunded and we have a Square payment, refund it
  let squareRefundId: string | null = null;
  if (status === "refunded" && existing.status !== "refunded" && existing.square_payment_id) {
    const refundRes = await fetch("https://connect.squareup.com/v2/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-10-17",
      },
      body: JSON.stringify({
        idempotency_key: `refund-${id}`,
        payment_id: existing.square_payment_id,
        amount_money: { amount: existing.total_cents, currency: "USD" },
        reason: notes || "Admin-initiated refund",
      }),
    });

    const refundData = await refundRes.json();
    if (!refundRes.ok) {
      const msg = refundData.errors?.[0]?.detail ?? "Square refund failed.";
      console.error("Square refund failed:", refundData);
      return NextResponse.json({ error: `Refund failed: ${msg}` }, { status: refundRes.status });
    }
    squareRefundId = refundData.refund?.id ?? null;
  }

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (notes !== undefined) {
    updates.notes = notes;
  }
  if (squareRefundId) {
    updates.square_refund_id = squareRefundId;
  }

  const { data, error } = await supabase
    .from("pavilion_bookings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Admin booking update error:", error);
    return NextResponse.json({ error: "Failed to update booking." }, { status: 500 });
  }

  return NextResponse.json({ booking: data, squareRefundId });
}
