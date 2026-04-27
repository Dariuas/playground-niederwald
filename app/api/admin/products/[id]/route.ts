import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/adminAuth";

const SQUARE_BASE = "https://connect.squareup.com/v2/catalog/object";
const SQUARE_VERSION = "2024-10-17";

function squareHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Square-Version": SQUARE_VERSION,
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  const {
    name,
    description,
    priceCents,
    category,
    isActive,
    sortOrder,
  } = body as {
    name?: string;
    description?: string;
    priceCents?: number;
    category?: string;
    isActive?: boolean;
    sortOrder?: number;
  };

  const supabase = getSupabaseAdmin();

  // Fetch existing product
  const { data: existing, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // Build DB update object
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (priceCents !== undefined) updates.price_cents = priceCents;
  if (category !== undefined) updates.category = category;
  if (isActive !== undefined) updates.is_active = isActive;
  if (sortOrder !== undefined) updates.sort_order = sortOrder;

  // Square price sync if price changed and object is linked
  let squareSynced: boolean | undefined;
  let warning: string | undefined;

  const priceChanged =
    priceCents !== undefined && priceCents !== existing.price_cents;
  const hasSquareLink = !!existing.square_catalog_object_id;

  if (priceChanged && hasSquareLink) {
    try {
      // Fetch current Square object to get version number
      const getRes = await fetch(
        `${SQUARE_BASE}/${existing.square_catalog_object_id}`,
        { headers: squareHeaders() }
      );
      const getData = await getRes.json();

      if (!getRes.ok) {
        throw new Error(
          getData?.errors?.[0]?.detail ?? `Square GET error ${getRes.status}`
        );
      }

      const currentObject = getData.object;
      const currentVersion = currentObject.version;

      // Find the variation to update
      const variations: Array<Record<string, unknown>> =
        currentObject.item_data?.variations ?? [];

      const updatedVariations = variations.map(
        (v: Record<string, unknown>) => {
          const varId = existing.square_variation_id;
          if (v.id === varId) {
            const itemVariationData = (v.item_variation_data ?? {}) as Record<string, unknown>;
            return {
              ...v,
              item_variation_data: {
                ...itemVariationData,
                price_money: {
                  amount: priceCents,
                  currency: "USD",
                },
              },
            };
          }
          return v;
        }
      );

      const upsertPayload = {
        idempotency_key: randomUUID(),
        object: {
          ...currentObject,
          version: currentVersion,
          item_data: {
            ...currentObject.item_data,
            variations: updatedVariations,
          },
        },
      };

      const updateRes = await fetch(SQUARE_BASE, {
        method: "POST",
        headers: squareHeaders(),
        body: JSON.stringify(upsertPayload),
      });
      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(
          updateData?.errors?.[0]?.detail ??
            `Square update error ${updateRes.status}`
        );
      }

      squareSynced = true;
    } catch (err) {
      console.error("Square catalog update failed:", err);
      squareSynced = false;
      warning =
        err instanceof Error
          ? `Square sync failed: ${err.message}`
          : "Square sync failed: unknown error";
    }
  }

  // Update DB
  const { data: product, error: updateError } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("Admin product update error:", updateError);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }

  const response: Record<string, unknown> = { ok: true, product };
  if (squareSynced !== undefined) response.squareSynced = squareSynced;
  if (warning) response.warning = warning;

  return NextResponse.json(response);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: product, error } = await supabase
    .from("products")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Admin product soft-delete error:", error);
    return NextResponse.json(
      { error: `Failed to deactivate product: ${error.message}` },
      { status: 500 }
    );
  }

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, product });
}
