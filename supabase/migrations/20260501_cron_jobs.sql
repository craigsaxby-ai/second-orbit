-- Migration: cron_jobs table
-- Created: 2026-05-01

CREATE TABLE IF NOT EXISTS cron_jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  schedule_expr TEXT NOT NULL,   -- cron expression e.g. "50 5 * * *"
  schedule_human TEXT NOT NULL,  -- human readable e.g. "Daily at 5:50 AM (Riyadh)"
  model TEXT,                    -- LLM used e.g. "claude-haiku-4-5"
  model_display TEXT,            -- display name e.g. "Claude Haiku"
  delivery_channel TEXT,         -- e.g. "telegram"
  delivery_to TEXT,              -- e.g. "Sax"
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,          -- "ok" | "error" | "skipped"
  next_run_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO cron_jobs (id, name, description, schedule_expr, schedule_human, model, model_display, delivery_channel, delivery_to, enabled, notes)
VALUES
(
  'abc7f071-0bbe-4264-b23a-df1620c06df3',
  'Searchline Daily Brief',
  'Pulls git log from Searchline Engine repo, reads memory files, queries Supabase for open Searchline tasks, marks shipped items as done, and writes a structured daily brief (progress, blockers, priorities, cost alerts, recommended action). Delivered to Sax on Telegram every morning.',
  '50 5 * * *',
  'Daily at 5:50 AM (Riyadh)',
  'anthropic/claude-haiku-4-5',
  'Claude Haiku',
  'telegram',
  'Sax',
  true,
  'Reads SEARCHLINE_MISSION_CONTROL.md for prompt/rules. Hard cap: 4096 chars (Telegram limit). Splits into Part 1/2 if over limit.'
),
(
  '0b409746-4092-4bb8-9106-075f63bc6bdd',
  'Second Orbit Brief',
  'Covers all non-Searchline products (Candidate Portal, Salary Benchmark, Achievement Record, Second Orbit). Pulls git logs from all 4 repos, reads memory files, queries Supabase for non-searchline tasks, and writes a product-wide progress brief. Runs every 2 days.',
  '0 7 */2 * *',
  'Every 2 days at 7:00 AM (Riyadh)',
  'anthropic/claude-haiku-4-5',
  'Claude Haiku',
  'telegram',
  'Sax',
  true,
  'Reads SECOND_ORBIT_BRIEF.md for prompt/rules. Covers: candidate-portal, salary-benchmark, proofline (Achievement Record), second-orbit repos.'
)
ON CONFLICT (id) DO NOTHING;
