import pool from "../database/db.js";

export async function getSolaByNameOrCode(nome_sola, codigo_sola) {
  const result = await pool.query(
    "SELECT id, nome_sola, codigo_sola FROM solas WHERE nome_sola = $1 OR codigo_sola = $2 LIMIT 1",
    [nome_sola, codigo_sola],
  );
  return result.rows[0] || null;
}

export async function createSolas(nome_sola, codigo_sola, data_atualizacao) {
  const result = await pool.query(
    "INSERT INTO solas (nome_sola, codigo_sola, data_atualizacao) VALUES ($1, $2, $3) RETURNING id",
    [nome_sola, codigo_sola, data_atualizacao],
  );
  return result.rows[0].id;
}
