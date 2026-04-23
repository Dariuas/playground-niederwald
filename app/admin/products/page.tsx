"use client";

import { useEffect, useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
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
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Park Entry",
  "Food & Drinks",
  "Experiences",
  "Merchandise",
  "Add-ons",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "Park Entry":    "bg-teal-100 text-teal-800",
  "Food & Drinks": "bg-orange-100 text-orange-800",
  "Experiences":   "bg-purple-100 text-purple-800",
  "Merchandise":   "bg-pink-100 text-pink-800",
  "Add-ons":       "bg-blue-100 text-blue-800",
};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Square Sync Badge ────────────────────────────────────────────────────────

function SyncBadge({ synced }: { synced: boolean }) {
  return synced ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      Synced to Square
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
      Not synced
    </span>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? "bg-stone-100 text-stone-700";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {category}
    </span>
  );
}

// ─── Inline Price Editor ──────────────────────────────────────────────────────

function InlinePriceEditor({
  productId,
  currentCents,
  onSaved,
}: {
  productId: string;
  currentCents: number;
  onSaved: (newCents: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState((currentCents / 100).toFixed(2));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setValue((currentCents / 100).toFixed(2));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function save() {
    const newCents = Math.round(parseFloat(value) * 100);
    if (isNaN(newCents) || newCents < 0) {
      setEditing(false);
      return;
    }
    if (newCents === currentCents) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceCents: newCents }),
      });
      if (res.ok) {
        onSaved(newCents);
      }
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={startEdit}
        title="Click to edit price"
        className="font-bold text-stone-800 hover:text-teal-700 hover:underline transition-colors cursor-pointer"
      >
        {formatPrice(currentCents)}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-stone-500 text-sm">$</span>
      <input
        ref={inputRef}
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
        disabled={saving}
        className="w-20 border border-teal-400 rounded px-1.5 py-0.5 text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
      />
    </div>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({
  product,
  onUpdate,
  onDeactivate,
}: {
  product: Product;
  onUpdate: (updated: Product) => void;
  onDeactivate: (id: string) => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok && data.product) {
        onUpdate(data.product);
        setSyncMsg("Synced!");
      } else {
        setSyncMsg(data.error ?? "Sync failed");
      }
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  }

  async function handleToggleActive() {
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.is_active }),
      });
      const data = await res.json();
      if (data.ok && data.product) {
        onUpdate(data.product);
      }
    } finally {
      setToggling(false);
    }
  }

  function handlePriceSaved(newCents: number) {
    onUpdate({ ...product, price_cents: newCents });
  }

  return (
    <div
      className={`bg-white border rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 transition-opacity ${
        !product.is_active ? "opacity-60" : ""
      }`}
    >
      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold text-stone-800 truncate">{product.name}</span>
          {!product.is_active && (
            <span className="text-xs font-semibold text-stone-400 italic">Inactive</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={product.category} />
          <SyncBadge synced={!!product.square_catalog_object_id} />
        </div>
        {product.description && (
          <p className="text-stone-500 text-xs mt-1 truncate">{product.description}</p>
        )}
      </div>

      {/* Price (inline edit) */}
      <div className="flex-shrink-0">
        <InlinePriceEditor
          productId={product.id}
          currentCents={product.price_cents}
          onSaved={handlePriceSaved}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        {/* Re-sync button (only if not synced) */}
        {!product.square_catalog_object_id && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 transition-colors disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "Sync to Square"}
          </button>
        )}
        {syncMsg && (
          <span className="text-xs font-semibold text-green-700">{syncMsg}</span>
        )}

        {/* Active toggle */}
        <button
          onClick={handleToggleActive}
          disabled={toggling}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
            product.is_active
              ? "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100"
              : "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
          }`}
        >
          {toggling ? "…" : product.is_active ? "Deactivate" : "Activate"}
        </button>

        {/* Deactivate (soft-delete with confirm) */}
        {product.is_active && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          >
            Remove
          </button>
        )}
        {confirming && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-stone-500">Sure?</span>
            <button
              onClick={() => {
                onDeactivate(product.id);
                setConfirming(false);
              }}
              className="text-xs font-bold px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs font-semibold px-2 py-1 rounded bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Product Form ─────────────────────────────────────────────────────────

interface FormState {
  name: string;
  description: string;
  price: string;
  category: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  category: "Park Entry",
};

function AddProductForm({ onAdded }: { onAdded: (product: Product) => void }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    squareSynced?: boolean;
  } | null>(null);

  function setField(field: keyof FormState, val: string) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const priceCents = Math.round(parseFloat(form.price) * 100);
    if (!form.name.trim()) {
      setFeedback({ type: "error", message: "Product name is required." });
      return;
    }
    if (isNaN(priceCents) || priceCents < 0) {
      setFeedback({ type: "error", message: "Please enter a valid price." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          priceCents,
          category: form.category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error ?? "Failed to create product." });
        return;
      }

      onAdded(data.product);
      setForm(EMPTY_FORM);
      setFeedback({
        type: "success",
        message: data.warning
          ? `Product created. ${data.warning}`
          : "Product created and synced to Square.",
        squareSynced: data.squareSynced,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
      <h2 className="text-stone-800 font-black text-lg mb-5">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Train Ride Ticket"
            required
            className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Optional product description…"
            rows={2}
            className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Price (USD) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm pointer-events-none">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="0.00"
              required
              className="w-full border border-stone-200 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold flex items-start gap-2 ${
              feedback.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <span className="mt-0.5 flex-shrink-0">
              {feedback.type === "success" ? "✓" : "✕"}
            </span>
            <div>
              <span>{feedback.message}</span>
              {feedback.type === "success" && (
                <div className="mt-1">
                  <SyncBadge synced={feedback.squareSynced ?? false} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold py-3 px-5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-sm"
        >
          {submitting ? "Creating…" : "Add Product + Sync to Square"}
        </button>
      </form>
    </div>
  );
}

// ─── Products List ────────────────────────────────────────────────────────────

function ProductsList({
  products,
  onUpdate,
  onDeactivate,
}: {
  products: Product[];
  onUpdate: (updated: Product) => void;
  onDeactivate: (id: string) => void;
}) {
  const active = products.filter((p) => p.is_active);
  const inactive = products.filter((p) => !p.is_active);

  if (products.length === 0) {
    return (
      <div className="bg-white border border-amber-100 rounded-2xl p-10 text-center shadow-sm">
        <p className="text-stone-400 font-semibold">No products yet.</p>
        <p className="text-stone-300 text-sm mt-1">Add your first product using the form.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {active.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 pl-1">
            Active ({active.length})
          </h3>
          <div className="space-y-2">
            {active.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                onUpdate={onUpdate}
                onDeactivate={onDeactivate}
              />
            ))}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 pl-1 mt-4">
            Inactive ({inactive.length})
          </h3>
          <div className="space-y-2">
            {inactive.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                onUpdate={onUpdate}
                onDeactivate={onDeactivate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Failed to load products.");
      } else {
        setProducts(data.products ?? []);
      }
    } catch {
      setLoadError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleAdded(product: Product) {
    setProducts((prev) => [product, ...prev]);
  }

  function handleUpdate(updated: Product) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function handleDeactivate(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok && data.product) {
        handleUpdate(data.product);
      } else {
        alert(data.error ?? "Failed to remove product.");
      }
    } catch (err) {
      alert("Network error — could not remove product.");
      console.error("Deactivate failed:", err);
    }
  }

  const syncedCount = products.filter((p) => p.square_catalog_object_id).length;
  const activeCount = products.filter((p) => p.is_active).length;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-stone-800">Products</h1>
        <p className="text-stone-500 text-sm mt-1">
          Manage products and sync them to your Square catalog.
        </p>
      </div>

      {/* Stats bar */}
      {!loading && !loadError && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total</p>
            <p className="text-xl font-black text-stone-800">{products.length}</p>
          </div>
          <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active</p>
            <p className="text-xl font-black text-teal-700">{activeCount}</p>
          </div>
          <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Square Synced
            </p>
            <p className="text-xl font-black text-green-700">{syncedCount}</p>
          </div>
          {syncedCount < products.length && (
            <div className="bg-white border border-yellow-200 rounded-xl px-4 py-2.5 shadow-sm">
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">
                Not Synced
              </p>
              <p className="text-xl font-black text-yellow-700">
                {products.length - syncedCount}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Add form */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <AddProductForm onAdded={handleAdded} />
        </div>

        {/* Right: Products list */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="bg-white border border-amber-100 rounded-2xl p-10 text-center shadow-sm">
              <div className="inline-block w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-stone-400 font-semibold text-sm">Loading products…</p>
            </div>
          ) : loadError ? (
            <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
              <p className="text-red-700 font-semibold mb-3">{loadError}</p>
              <button
                onClick={loadProducts}
                className="text-sm font-bold px-4 py-2 rounded-xl bg-teal-700 text-white hover:bg-teal-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <ProductsList
              products={products}
              onUpdate={handleUpdate}
              onDeactivate={handleDeactivate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
