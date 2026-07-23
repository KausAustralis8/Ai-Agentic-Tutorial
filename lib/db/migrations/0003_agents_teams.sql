CREATE TABLE IF NOT EXISTS agents (
  user_id TEXT NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  role TEXT NOT NULL,
  color TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  task TEXT,
  score TEXT,
  goal TEXT,
  char TEXT,
  type TEXT NOT NULL DEFAULT 'custom',
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

CREATE TABLE IF NOT EXISTS agent_config (
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  role TEXT,
  goal TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (user_id, agent_id)
);

CREATE TABLE IF NOT EXISTS agent_states (
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  removed BOOLEAN NOT NULL DEFAULT false,
  paused BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, agent_id)
);

CREATE TABLE IF NOT EXISTS teams (
  user_id TEXT NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  icon_bg TEXT,
  description TEXT,
  goal TEXT,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  activity JSONB NOT NULL DEFAULT '[]'::jsonb,
  meetings JSONB NOT NULL DEFAULT '[]'::jsonb,
  pipeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  leads JSONB NOT NULL DEFAULT '[]'::jsonb,
  template TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

CREATE TABLE IF NOT EXISTS team_members (
  user_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  PRIMARY KEY (user_id, team_id)
);
