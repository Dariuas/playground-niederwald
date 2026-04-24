import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/adminAuth";

const SQUARE_API_URL = "https://connect.squareup.com/v2/catalog/object";
const SQUARE_VERSION = "2024-10-17";

function squareHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Square-Version": SQUARE_VERSION,
  };
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }

  return NextResponse.json({ products: products ?? [] });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const body = await req.json();
  const { name, description, priceCents, category } = body as {
    name: string;
    description?: string;
    priceCents: number;
    category: string;
  };

  if (!name || typeof priceCents !== "number" || !category) {
    return NextResponse.json(
      { error: "name, priceCents, and category are required." },
      { status: 400 }
    );
  }

  // Step 1: Create Square catalog item
  let squareCatalogObjectId: string | null = null;
  let squareVariationId: string | null = null;
  let squareSynced = false;
  let warning: string | undefined;

  try {
    const squarePayload = {
      idempotency_key: randomUUID(),
      object: {
        type: "ITEM",
        id: "#temp",
        item_data: {
          name,
          description: description ?? "",
          variations: [
            {
              type: "ITEM_VARIATION",
              id: "#temp_var",
              item_variation_data: {
                item_id: "#temp",
                name: "Regular",
                pricing_type: "FIXED_PRICING",
                price_money: {
                  amount: priceCents,
                  currency: "USD",
                },
              },
            },
          ],
        },
      },
    };

    const squareRes = await fetch(SQUARE_API_URL, {
      method: "POST",
      headers: squareHeaders(),
      body: JSON.stringify(squarePayload),
    });

    const squareData = await squareRes.json();

    if (!squareRes.ok) {
      throw new Error(
        squareData?.errors?.[0]?.detail ?? `Square API error ${squareRes.status}`
      );
    }

    // Step 2: Extract IDs from response
    const catalogObject = squareData.catalog_object;
    squareCatalogObjectId = catalogObject?.id ?? null;
    squareVariationId =
      catalogObject?.item_data?.variations?.[0]?.id ?? null;
    squareSynced = true;
  } catch (err) {
    console.error("Square catalog create failed:", err);
    warning =
      err instanceof Error
        ? `Square sync failed: ${err.message}`
        : "Square sync failed: unknown error";
  }

  // Step 3: Insert into Supabase
  const supabase = getSupabaseAdmin();

  const { data: product, error: dbError } = await supabase
    .from("products")
    .insert({
      name,
      description: description ?? null,
      price_cents: priceCents,
      category,
      is_active: true,
      square_catalog_object_id: squareCatalogObjectId,
      square_variation_id: squareVariationId,
      sort_order: 0,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Admin product insert error:", dbError);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }

  const response: Record<string, unknown> = { ok: true, product, squareSynced };
  if (warning) response.warning = warning;

  return NextResponse.json(response, { status: 201 });
}
