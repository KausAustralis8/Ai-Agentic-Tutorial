CREATE TABLE IF NOT EXISTS creator_profile (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  niche TEXT,
  bio TEXT,
  platforms JSONB NOT NULL DEFAULT '[]'::jsonb,
  audience JSONB NOT NULL DEFAULT '{}'::jsonb,
  tone TEXT,
  past_deals TEXT,
  rate_floor TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
