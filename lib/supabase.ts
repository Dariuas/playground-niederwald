import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Server-side client — full DB access via service role. Never expose in browser. */
export function getSupabaseAdmin() {
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/** Browser-safe client — respects Row Level Security. */
export function getSupabaseClient() {
  return createClient(url, anonKey);
}

export type Database = {
  pavilion_bookings: {
    id: string;
    reservation_id: string;
    pavilion_id: string;
    pavilion_name: string;
    date: string;
    start_time: string;
    duration_hours: number;
    end_time: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string | null;
    total_cents: number;
    status: "confirmed" | "cancelled" | "refunded";
    square_payment_id: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  pavilion_configs: {
    pavilion_id: string;
    first_hour_price_cents: number;
    add_hour_price_cents: number;
    is_active: boolean;
    updated_at: string;
  };
  products: {
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    category: string;
    is_active: boolean;
    square_catalog_object_id: string | null;
    square_variation_id: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
  };
};

/** Add hours to a "HH:MM" time string. Returns "HH:MM". */
export function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + (m ?? 0) + hours * 60;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
