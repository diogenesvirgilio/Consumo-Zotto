import crypto from "crypto";

// Armazenar tokens em memória (em produção, usar Redis ou DB)
const csrfTokens = new Map();

export function generateCsrfToken(sessionId) {
  const token = crypto.randomBytes(32).toString("hex");

  if (!csrfTokens.has(sessionId)) {
    csrfTokens.set(sessionId, []);
  }

  csrfTokens.get(sessionId).push(token);

  // Limpar tokens antigos (manter apenas últimos 5)
  const tokens = csrfTokens.get(sessionId);
  if (tokens.length > 5) {
    tokens.shift();
  }

  return token;
}

export function verifyToken(sessionId, token) {
  if (!sessionId || !token) return false;

  const tokens = csrfTokens.get(sessionId) || [];

  // Aceita qualquer token válido da sessão
  if (tokens.includes(token)) {
    // Remover token após uso
    tokens.splice(tokens.indexOf(token), 1);
    return true;
  }

  return false;
}

export const csrfProtection = (req, res, next) => {
  // GET, HEAD, OPTIONS não precisam de CSRF
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Rotas públicas (auth) não precisam de CSRF
  if (req.path.startsWith("/auth")) {
    return next();
  }

  const token = req.headers["x-csrf-token"] || req.body?.csrfToken;
  const sessionId = req.usuario?.id || req.cookies.sessionId;

  if (!sessionId || !token || !verifyToken(sessionId, token)) {
    return res.status(403).json({ error: "Token CSRF inválido ou expirado" });
  }

  next();
};
