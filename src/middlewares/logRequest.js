import pool from "../database/db.js";

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
