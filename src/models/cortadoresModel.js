import pool from "../database/db.js";

export async function getCortadores() {
  const result = await pool.query("SELECT * FROM cortadores ORDER BY id ASC");
  return result.rows;
}

export async function getCortadorById(id) {
  const result = await pool.query("SELECT * FROM cortadores WHERE id = $1", [
    id,
  ]);
  return result.rows[0];
}

export async function createCortador(nome, nivel_experiencia) {
  const result = await pool.query(
    "INSERT INTO cortadores (nome, nivel_experiencia) VALUES ($1, $2) RETURNING *",
    [nome, nivel_experiencia]
  );
  return result.rows[0];
}

export async function updateCortador(id, nome, nivel_experiencia) {
  const result = await pool.query(
    "UPDATE cortadores SET nome = $1, nivel_experiencia = $2 WHERE id = $3 RETURNING *",
    [nome, nivel_experiencia, id]
  );
  return result.rows[0];
}

export async function deleteCortador(id) {
  const result = await pool.query("DELETE FROM cortadores WHERE id = $1", [id]);
  return result.rows[0];
}
