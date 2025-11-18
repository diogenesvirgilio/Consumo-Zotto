import pool from "../database/db.js";

export async function getMateriaprima() {
  const result = await pool.query(
    "SELECT * FROM materia_prima ORDER BY id ASC"
  );
  return result.rows;
}

export async function getMateriaprimaById(id) {
  const result = await pool.query("SELECT * FROM materia_prima WHERE id = $1", [
    id,
  ]);
  return result.rows[0];
}

export async function createMateriaprima(nome) {
  const result = await pool.query(
    "INSERT INTO materia_prima (nome) VALUES ($1) RETURNING *",
    [nome]
  );
  return result.rows[0];
}

export async function updateMateriaprima(id, nome) {
  const result = await pool.query(
    "UPDATE materia_prima SET nome = $1 WHERE id = $2 RETURNING *",
    [nome, id]
  );
  return result.rows[0];
}

export async function deleteMateriaprima(id) {
  await pool.query("DELETE FROM materia_prima WHERE id = $1", [id]);
}
