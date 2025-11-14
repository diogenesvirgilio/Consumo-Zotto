-- Safe finalize migration: only runs if column token_hash exists
BEGIN;

-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'refresh_tokens' AND column_name = 'token_hash'
  ) THEN
    -- Update token from token_hash (store sha256 hex of the token_hash value)
    EXECUTE 'UPDATE refresh_tokens SET token = encode(digest(token_hash, ''sha256''), ''hex'') WHERE token_hash IS NOT NULL';

    -- Create index on token for faster lookups
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token)';

    -- Drop the token_hash column
    EXECUTE 'ALTER TABLE refresh_tokens DROP COLUMN IF EXISTS token_hash';

    RAISE NOTICE 'token_hash column found and migrated; token_hash dropped.';
  ELSE
    RAISE NOTICE 'token_hash column not found; skipping migration.';
  END IF;
END$$;

COMMIT;
