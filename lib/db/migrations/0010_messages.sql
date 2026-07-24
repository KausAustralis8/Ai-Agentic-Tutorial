CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT,
  who TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_user_agent_id_idx ON messages (user_id, agent_id, id);
