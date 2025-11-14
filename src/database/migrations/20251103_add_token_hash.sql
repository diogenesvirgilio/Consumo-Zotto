-- Adiciona coluna token_hash e migra dados existentes
ALTER TABLE refresh_tokens ADD COLUMN token_hash VARCHAR(128);

-- Copiar tokens existentes para a nova coluna (temporariamente)
UPDATE refresh_tokens SET token_hash = token WHERE token_hash IS NULL;

-- Remover coluna antiga após verificar migração
-- ALTER TABLE refresh_tokens DROP COLUMN token;
-- ALTER TABLE refresh_tokens RENAME COLUMN token_hash TO token;

-- Adicionar índice para busca rápida por hash
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);