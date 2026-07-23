CREATE TABLE IF NOT EXISTS outreach_drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT,
  lead_id TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  rationale TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS outreach_drafts_user_lead_idx ON outreach_drafts (user_id, lead_id);

CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT,
  lead_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS proposals_user_lead_idx ON proposals (user_id, lead_id);
