-- Finaliza migração de refresh tokens para armazenar apenas hashes
-- 1) Gera hash SHA-256 a partir da coluna token_hash e grava na coluna token
-- 2) Cria índice para pesquisa por token (hash)
-- 3) Remove a coluna token_hash antiga
-- Observação: Este script usa a extensão pgcrypto para digest(); se não estiver instalada,
-- instale com: CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- Garantir que pgcrypto esteja disponível
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Atualizar a coluna 'token' com o hash SHA-256 do valor em 'token_hash' quando existir
-- Usamos encode(digest(...), 'hex') para obter representação hexadecimal compatível com nossa função JS (sha256 hex)
UPDATE refresh_tokens
SET token = encode(digest(token_hash, 'sha256'), 'hex')
WHERE token_hash IS NOT NULL;

-- Criar índice para acelerar buscas por token (hash)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);

-- Opcional: se tudo estiver verificado, remover a coluna token_hash
ALTER TABLE refresh_tokens DROP COLUMN IF EXISTS token_hash;

COMMIT;

-- Recomenda-se criar backup antes de executar este script.
-- Execução via psql (PowerShell):
-- psql -h <DB_HOST> -U <DB_USER> -d <DB_DATABASE> -f src/database/migrations/20251103_finalize_token_hash.sql

-- Ou executar a migração com o script Node já presente (mais seguro se preferir usar pool configurado no projeto).
