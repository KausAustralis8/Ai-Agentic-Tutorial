CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  score TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  review TEXT NOT NULL DEFAULT 'accepted',
  profile_url TEXT,
  platform TEXT,
  research JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_user_agent_idx ON leads (user_id, agent_id);
CREATE INDEX IF NOT EXISTS leads_user_review_idx ON leads (user_id, review);

CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT,
  type TEXT NOT NULL,
  lead_id TEXT,
  text TEXT NOT NULL,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_user_created_idx ON activity (user_id, created_at);
