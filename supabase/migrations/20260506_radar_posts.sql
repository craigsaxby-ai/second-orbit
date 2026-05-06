-- Migration: radar_posts table
-- Created: 2026-05-06

CREATE TABLE IF NOT EXISTS radar_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE,
  channel     TEXT,
  format      TEXT,
  topic       TEXT,
  hook        TEXT,
  draft_text  TEXT,
  risk_status TEXT,
  risk_notes  TEXT,
  status      TEXT DEFAULT 'drafted',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE radar_posts ENABLE ROW LEVEL SECURITY;

-- Policy: allow all (internal tool, no auth)
CREATE POLICY "Allow all" ON radar_posts FOR ALL USING (true) WITH CHECK (true);
