import { hashToken } from "../../utils/crypto.js";
import pool from "../db.js";
import logger from "../../utils/logger.js";

async function migrateRefreshTokens() {
  const client = await pool.connect();

  try {
    // Iniciar transação
    await client.query("BEGIN");

    // 1. Verificar se coluna token_hash já existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'refresh_tokens' 
      AND column_name = 'token_hash'
    `);

    if (checkColumn.rows.length === 0) {
      // 2. Adicionar coluna token_hash
      await client.query(`
        ALTER TABLE refresh_tokens 
        ADD COLUMN token_hash VARCHAR(128)
      `);

      // 3. Migrar tokens existentes
      const tokens = await client.query(
        "SELECT id, token FROM refresh_tokens WHERE token_hash IS NULL"
      );

      for (const row of tokens.rows) {
        const hash = hashToken(row.token);
        await client.query(
          "UPDATE refresh_tokens SET token_hash = $1 WHERE id = $2",
          [hash, row.id]
        );
      }

      // 4. Criar índice
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash 
        ON refresh_tokens(token_hash)
      `);

      // 5. Commit transação
      await client.query("COMMIT");

      logger.info("Migração de refresh_tokens concluída com sucesso");
    } else {
      logger.info("Coluna token_hash já existe, pulando migração");
      await client.query("ROLLBACK");
    }
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error("Erro na migração de refresh_tokens:", err);
    throw err;
  } finally {
    client.release();
  }
}

// Executar migração se este arquivo for executado diretamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  migrateRefreshTokens()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default migrateRefreshTokens;
