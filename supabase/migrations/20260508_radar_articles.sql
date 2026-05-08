-- Migration: radar_articles table
-- Created: 2026-05-08
-- Purpose: Store SEO/AEO article drafts for Searchline Radar

CREATE TABLE IF NOT EXISTS radar_articles (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  slug         text UNIQUE NOT NULL,
  summary      text,
  keywords     text[],
  body_md      text,
  status       text DEFAULT 'drafted',
  seo_focus    text,
  aeo_questions text[],
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS radar_articles_status_idx ON radar_articles(status);
CREATE INDEX IF NOT EXISTS radar_articles_created_at_idx ON radar_articles(created_at DESC);
