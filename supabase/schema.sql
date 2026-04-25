-- ============================================================
-- The Playground @niederwald — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Pavilion bookings (created when a user completes checkout)
CREATE TABLE IF NOT EXISTS pavilion_bookings (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id     TEXT        UNIQUE NOT NULL,             -- "RES-123456"
  pavilion_id        TEXT        NOT NULL,                    -- "pavilion-1"
  pavilion_name      TEXT        NOT NULL,
  date               DATE        NOT NULL,
  start_time         TIME        NOT NULL,                    -- "10:00"
  duration_hours     INTEGER     NOT NULL CHECK (duration_hours > 0),
  end_time           TIME        NOT NULL,                    -- "13:00" (stored, not generated)
  guest_name         TEXT        NOT NULL,
  guest_email        TEXT        NOT NULL,
  guest_phone        TEXT,
  total_cents        INTEGER     NOT NULL CHECK (total_cents > 0),
  status             TEXT        NOT NULL DEFAULT 'confirmed'
                                 CHECK (status IN ('confirmed','cancelled','refunded')),
  square_payment_id  TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_pavilion_date
  ON pavilion_bookings (pavilion_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON pavilion_bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_email
  ON pavilion_bookings (guest_email);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE OR REPLACE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON pavilion_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- Admin-editable pavilion pricing (overrides static defaults)
CREATE TABLE IF NOT EXISTS pavilion_configs (
  pavilion_id              TEXT    PRIMARY KEY,  -- "pavilion-1"
  first_hour_price_cents   INTEGER NOT NULL DEFAULT 3500,
  add_hour_price_cents     INTEGER NOT NULL DEFAULT 1500,
  is_active                BOOLEAN NOT NULL DEFAULT true,
  capacity                 INTEGER,              -- NULL = use static default from data/pavilions.ts
  name_override            TEXT,                 -- NULL = use static default from data/pavilions.ts
  description_override     TEXT,                 -- NULL = use static default
  features_override        JSONB,                -- NULL = use static default; array of strings
  map_x                    NUMERIC,              -- NULL = use static default (% of map width)
  map_y                    NUMERIC,              -- NULL = use static default (% of map height)
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration: add columns if upgrading from an older schema
ALTER TABLE pavilion_configs ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE pavilion_configs ADD COLUMN IF NOT EXISTS name_override TEXT;
ALTER TABLE pavilion_configs ADD COLUMN IF NOT EXISTS description_override TEXT;
ALTER TABLE pavilion_configs ADD COLUMN IF NOT EXISTS features_override JSONB;
ALTER TABLE pavilion_configs ADD COLUMN IF NOT EXISTS map_x NUMERIC;
ALTER TABLE pavilion_configs ADD COLUMN IF NOT EXISTS map_y NUMERIC;

-- Seed default configs
INSERT INTO pavilion_configs (pavilion_id, first_hour_price_cents, add_hour_price_cents)
VALUES
  ('pavilion-1', 3500, 1500),
  ('pavilion-2', 3500, 1500),
  ('pavilion-3', 3500, 1500),
  ('pavilion-4', 3500, 1500),
  ('pavilion-5', 3500, 1500)
ON CONFLICT (pavilion_id) DO NOTHING;


-- Products sold via the online store (admin-managed)
CREATE TABLE IF NOT EXISTS products (
  id                       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT    NOT NULL,
  description              TEXT,
  price_cents              INTEGER NOT NULL CHECK (price_cents >= 0),
  category                 TEXT    NOT NULL DEFAULT 'general',
  is_active                BOOLEAN NOT NULL DEFAULT true,
  square_catalog_object_id TEXT,
  square_variation_id      TEXT,
  sort_order               INTEGER NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed the existing child entry ticket
INSERT INTO products (name, description, price_cents, category, sort_order)
VALUES (
  'Child Entry Ticket',
  'Ages 3–12. One amazing day at the park — all included! Jumping blob, train rides, and full play zone.',
  1000,
  'Park Entry',
  1
) ON CONFLICT DO NOTHING;


-- Row Level Security — read-only for anon, full access for service role
ALTER TABLE pavilion_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pavilion_configs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;

-- Anon can read active pavilion configs (needed for pricing display)
CREATE POLICY "public read pavilion_configs"
  ON pavilion_configs FOR SELECT USING (true);

-- Anon can read active products (needed for store display)
CREATE POLICY "public read active products"
  ON products FOR SELECT USING (is_active = true);

-- Service role bypasses RLS — API routes use service role key
-- (No additional policies needed for server-side operations)


-- Site-wide configuration key/value store (used for announcements, etc.)
CREATE TABLE IF NOT EXISTS site_config (
  key        TEXT        PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site_config"
  ON site_config FOR SELECT USING (true);
