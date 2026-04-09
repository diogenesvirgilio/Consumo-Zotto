import logger from "../utils/logger.js";

// Função para sanitizar dados sensíveis de logs
function sanitizeErrorMessage(message) {
  if (!message) return message;

  // Remove padrões sensíveis
  let sanitized = String(message);

  // Remover senhas, tokens, emails
  sanitized = sanitized.replace(
    /senha\s*[:=][\s\S]*?[,})\n]/gi,
    "senha: [REDACTED]",
  );
  sanitized = sanitized.replace(
    /password\s*[:=][\s\S]*?[,})\n]/gi,
    "password: [REDACTED]",
  );
  sanitized = sanitized.replace(
    /token\s*[:=]\s*['"][\s\S]*?['"]?/gi,
    "token: [REDACTED]",
  );
  sanitized = sanitized.replace(
    /jwt\s*[:=]\s*['"][\s\S]*?['"]?/gi,
    "jwt: [REDACTED]",
  );
  sanitized = sanitized.replace(
    /email\s*[:=]\s*['"].*?['"]/gi,
    "email: [REDACTED]",
  );

  return sanitized;
}

export const errorHandler = (err, req, res, next) => {
  // Log completo no servidor (stack em dev)
  const logMessage =
    process.env.NODE_ENV === "production"
      ? sanitizeErrorMessage(err instanceof Error ? err.message : String(err))
      : err instanceof Error
        ? err.stack || err.message
        : err;

  logger.error(`[${req.method} ${req.path}] ${logMessage}`);

  // Tratar erros de validação
  if (err && err.name === "ValidationError") {
    return res.status(400).json({
      error: "Dados inválidos",
      details:
        process.env.NODE_ENV === "development"
          ? sanitizeErrorMessage(err.message)
          : undefined,
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
      details:
        process.env.NODE_ENV === "development"
          ? sanitizeErrorMessage(detail)
          : undefined,
    });
  }

  // Tratar erros de foreign key
  if (err && err.code === "23503") {
    return res.status(400).json({
      error: "Dados inválidos: referência a registro inexistente.",
      details:
        process.env.NODE_ENV === "development"
          ? "Registros relacionados não encontrados"
          : undefined,
    });
  }

  // Resposta em produção
  const status = err && err.status ? err.status : 500;

  let responseError = {
    error:
      process.env.NODE_ENV === "production"
        ? "Erro interno do servidor"
        : sanitizeErrorMessage(
            (err && err.message) || "Erro interno do servidor",
          ),
  };

  // Stack trace apenas em development, nunca em produção
  if (process.env.NODE_ENV === "development" && err && err.stack) {
    responseError.details = sanitizeErrorMessage(err.stack);
  }

  res.status(status).json({ responseError });
};
