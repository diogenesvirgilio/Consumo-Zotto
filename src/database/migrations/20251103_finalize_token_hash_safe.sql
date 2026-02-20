-- Finalizar migração com segurança: só é executada se a coluna token_hash existir.
BEGIN;

-- Verifica se o pgcrypto está disponível
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'refresh_tokens' AND column_name = 'token_hash'
  ) THEN

    -- Atualizar token a partir de token_hash (armazena o valor hexadecimal sha256 do token_hash)
    EXECUTE 'UPDATE refresh_tokens SET token = encode(digest(token_hash, ''sha256''), ''hex'') WHERE token_hash IS NOT NULL';

    -- Criar índice no token para pesquisas mais rápidas
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token)';

    -- Remover a coluna token_hash
    EXECUTE 'ALTER TABLE refresh_tokens DROP COLUMN IF EXISTS token_hash';

    RAISE NOTICE 'token_hash column found and migrated; token_hash dropped.';
  ELSE
    RAISE NOTICE 'token_hash column not found; skipping migration.';
  END IF;
END$$;

COMMIT;
