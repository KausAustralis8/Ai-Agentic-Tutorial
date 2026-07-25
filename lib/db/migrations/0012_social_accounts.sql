CREATE TABLE IF NOT EXISTS social_accounts (
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  open_id TEXT,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  scope TEXT,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  needs_reconnect BOOLEAN NOT NULL DEFAULT false,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, provider)
);
