import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (notes !== undefined) {
    updates.notes = notes;
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

  return NextResponse.json({ booking: data });
}
