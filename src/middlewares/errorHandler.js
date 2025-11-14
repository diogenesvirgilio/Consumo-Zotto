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

  const status = err && err.status ? err.status : 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Erro interno do servidor"
      : (err && err.message) || "Erro interno do servidor";
  const details =
    process.env.NODE_ENV === "production" ? undefined : err && err.stack;

  res.status(status).json({ error: message, details });
};
