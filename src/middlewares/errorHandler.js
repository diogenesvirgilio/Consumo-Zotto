import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  // Log completo no servidor (stack em dev)
  logger.error(err instanceof Error ? err.stack || err.message : err);

  if (err && err.name === "ValidationError") {
    return res.status(400).json({
      error: "Dados inválidos",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Tratar erros de constraint unique do PostgreSQL
  if (err && err.code === "23505") {
    const detail = err.detail || "";
    let message = "Este registro já existe no cadastro.";

    if (detail.includes("nome_sola")) {
      message = "Nome da sola já existe no cadastro.";
    } else if (detail.includes("codigo_sola")) {
      message = "Código da sola já existe no cadastro.";
    }

    return res.status(409).json({
      error: message,
      details: process.env.NODE_ENV === "development" ? detail : undefined,
    });
  }

  // Tratar erros de foreign key
  if (err && err.code === "23503") {
    return res.status(400).json({
      error: "Dados inválidos: referência a registro inexistente.",
      details: process.env.NODE_ENV === "development" ? err.detail : undefined,
    });
  }

  const status = err && err.status ? err.status : 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Erro interno do servidor"
      : (err && err.message) || "Erro interno do servidor";
  const details =
    process.env.NODE_ENV === "production" ? undefined : err && err.stack;

  res.status(status).json({ error: message, details });
};
