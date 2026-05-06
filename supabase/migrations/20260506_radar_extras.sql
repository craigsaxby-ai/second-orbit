-- radar_metrics: weekly LinkedIn stats
CREATE TABLE IF NOT EXISTS radar_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE,
  channel TEXT DEFAULT 'craig_linkedin',
  post_impressions INTEGER,
  followers INTEGER,
  profile_viewers INTEGER,
  search_appearances INTEGER,
  posts_published INTEGER,
  comments_received INTEGER,
  likes_received INTEGER,
  best_post TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE radar_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON radar_metrics FOR ALL USING (true) WITH CHECK (true);

-- radar_assets: named content assets
CREATE TABLE IF NOT EXISTS radar_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  asset_type TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE radar_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON radar_assets FOR ALL USING (true) WITH CHECK (true);
