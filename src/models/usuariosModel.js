import pool from "../database/db.js";

export async function getUsuarios() {
  const result = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");
  return result.rows;
}

export async function getUsuariosById(id) {
  const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
  return result.rows[0];
}

export async function createUsuario(nome, email, senha_hash, role) {
  const result = await pool.query(
    "INSERT INTO usuarios (nome, email, senha_hash, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [nome, email, senha_hash, role]
  );
  return result.rows[0];
}

export async function updateUsuario(id, nome, email, senha_hash, role) {
  const result = await pool.query(
    "UPDATE usuarios SET nome = $1, email = $2, senha_hash = $3, role = $4 WHERE id = $5 RETURNING *",
    [nome, email, senha_hash, role, id]
  );
  return result.rows[0];
}

export async function deleteUsuario(id) {
  await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
  return { message: "Usuário deletado com sucesso" };
}

export async function getUsuarioByEmail(email) {
  const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
}
