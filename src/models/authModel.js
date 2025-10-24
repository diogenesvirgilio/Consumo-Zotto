import pool from "../database/db.js";

export async function findUsuarioByEmail(email) {
  const result = await pool.query("SELECT * FROM usuarios WHERE email =$1", [
    email,
  ]);
  return result.rows[0];
}

export async function saveRefreshToken(usuarioId, token, expiracao) {
  const result = await pool.query(
    "INSERT INTO refresh_tokens (usuario_id, token, expiracao) VALUES ($1, $2, $3) RETURNING *",
    [usuarioId, token, expiracao]
  );
  return result.rows[0];
}

export async function findRefreshToken(token) {
  const result = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token = $1",
    [token]
  );
  return result.rows[0];
}

export async function deleteRefreshToken(token) {
  const result = await pool.query(
    "DELETE FROM refresh_tokens WHERE token = $1",
    [token]
  );
  return result.rowCount;
}

export async function deleteRefreshTokenTokensByUsuarioId(usuarioId) {
  const result = await pool.query(
    "DELETE FROM refresh_tokens WHERE usuario_id = $1",
    [usuarioId]
  );
  return result.rowCount;
}

export async function updateRefreshTokenExpiration(token, novaExpiracao) {
  const result = await pool.query(
    "UPDATE refresh_tokens SET expiracao = $1 WHERE token = $2 RETURNING *",
    [novaExpiracao, token]
  );
  return result.rows[0];
}

export async function saveTokenBlackList(token, expiracao) {
  const result = await pool.query(
    "INSERT INTO token_blacklist (token, expiracao) VALUES ($1, $2) RETURNING *",
    [token, expiracao]
  );
  return result.rows[0];
}

export async function isTokenBlacklisted(token) {
  const result = await pool.query(
    "SELECT 1 FROM token_blacklist WHERE token = $1 LIMIT 1;",
    [token]
  );
  return result.rows[0];
}

export async function logRequest(req, res, next) {
  try {
    if (req.usuario) {
      await pool.query(
        "INSERT INTO logs (usuario_id, rota, metodo) VALUES ($1, $2, $3)",
        [req.usuario.id, req.originalUrl, req.method]
      );
    }
  } catch (err) {
    res.status(403).json({ error: "Erro ao inserir o log" });
  }
  next();
}
