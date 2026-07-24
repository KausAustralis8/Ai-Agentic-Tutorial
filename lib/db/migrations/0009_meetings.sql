CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT,
  lead_id TEXT,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'call',
  when_at TIMESTAMPTZ NOT NULL,
  when_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meetings_user_when_idx ON meetings (user_id, when_at);
