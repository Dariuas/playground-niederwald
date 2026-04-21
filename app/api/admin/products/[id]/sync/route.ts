import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

const SQUARE_API_URL = "https://connect.squareup.com/v2/catalog/object";
const SQUARE_VERSION = "2024-10-17";

function squareHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Square-Version": SQUARE_VERSION,
  };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // If already synced, skip
  if (product.square_catalog_object_id) {
    return NextResponse.json({
      ok: true,
      squareSynced: true,
      message: "Product already synced to Square.",
      product,
    });
  }

  try {
    const squarePayload = {
      idempotency_key: randomUUID(),
      object: {
        type: "ITEM",
        id: "#temp",
        item_data: {
          name: product.name,
          description: product.description ?? "",
          variations: [
            {
              type: "ITEM_VARIATION",
              id: "#temp_var",
              item_variation_data: {
                item_id: "#temp",
                name: "Regular",
                pricing_type: "FIXED_PRICING",
                price_money: {
                  amount: product.price_cents,
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

    const catalogObject = squareData.catalog_object;
    const squareCatalogObjectId = catalogObject?.id ?? null;
    const squareVariationId = catalogObject?.item_data?.variations?.[0]?.id ?? null;

    const { data: updated, error: updateError } = await supabase
      .from("products")
      .update({
        square_catalog_object_id: squareCatalogObjectId,
        square_variation_id: squareVariationId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error("Synced to Square but failed to update DB.");
    }

    return NextResponse.json({ ok: true, squareSynced: true, product: updated });
  } catch (err) {
    console.error("Square re-sync failed:", err);
    return NextResponse.json(
      {
        ok: false,
        squareSynced: false,
        error:
          err instanceof Error ? err.message : "Square sync failed: unknown error",
      },
      { status: 500 }
    );
  }
}
