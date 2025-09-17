import pool from "../database/db.js";

export async function getUsuarios() {
    const result = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");
    return result.rows;
} 

export async function getUsuariosById(id) {
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    return result.rows[0];
} 

export async function createUsuario(nome, email, senha_hash, criado_em, role) {
    const result = await pool.query(
        "INSERT INTO usuarios (nome, email, senha_hash, criado_em, role) VALUES ($1, $2, $3, $4, $5) RETURNING *", 
        [nome, email, senha_hash, criado_em, role]
    ); 
    return result.rows[0];
}

export async function updateUsuario(id, nome, email, senha_hash, criado_em, role) {
    const result = await pool.query(
        "UPDATE usuarios SET nome = $1, email = $2, senha_hash = $3, criado_em = $4, role = $5 WHERE id = $6 RETURNING *",
        [nome, email, senha_hash, criado_em, role, id]
    ); 
    return result.rows[0];
} 

export async function deleteUsuario(id) {
    await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    return { message: "Usuário deletado com sucesso" };
} 

export async function getUsuarioByEmail(email) {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    return result.rows[0];
}