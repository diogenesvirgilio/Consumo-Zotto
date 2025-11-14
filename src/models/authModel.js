import pool from "../database/db.js";

export async function findUsuarioByEmail(email) {
  const result = await pool.query("SELECT * FROM usuarios WHERE email =$1", [
    email,
  ]);
  return result.rows[0];
}

export async function saveRefreshToken(usuarioId, tokenHash, expiracao) {
  /* Usamos ON CONFLICT para prevenir erro de unique violation.*/
  const result = await pool.query(
    `INSERT INTO refresh_tokens (usuario_id, token_hash, expiracao)
     VALUES ($1, $2, $3)
     ON CONFLICT (token_hash) DO UPDATE SET expiracao = EXCLUDED.expiracao   
     RETURNING *`,
    [usuarioId, tokenHash, expiracao]
  );
  return result.rows[0];
}

export async function findRefreshToken(tokenHash) {
  const result = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token_hash = $1",
    [tokenHash]
  );
  return result.rows[0];
}

export async function deleteRefreshToken(tokenHash) {
  const result = await pool.query(
    "DELETE FROM refresh_tokens WHERE token_hash = $1",
    [tokenHash]
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

export async function updateRefreshTokenExpiration(tokenHash, novaExpiracao) {
  const result = await pool.query(
    "UPDATE refresh_tokens SET expiracao = $1 WHERE token_hash = $2 RETURNING *",
    [novaExpiracao, tokenHash]
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
