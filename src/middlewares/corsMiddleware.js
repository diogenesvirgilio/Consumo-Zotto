import cors from "cors";

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = allowedOriginsEnv
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Em desenvolvimento
const devOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Requisições sem origin (Postman, mobile, curl)
    if (!origin) return callback(null, true);

    // Se está em produção sem configurar ALLOWED_ORIGINS, nega automaticamente
    if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
      return callback(
        new Error("CORS não configurado. Configure ALLOWED_ORIGINS"),
      );
    }

    // Em desenvolvimento, usar lista padrão
    const origensAceitas =
      process.env.NODE_ENV === "development" && allowedOrigins.length === 0
        ? devOrigins
        : allowedOrigins;

    // Bloqueia se não estiver na lista
    if (!origensAceitas.includes(origin)) {
      return callback(new Error("Origem não permitida pelo CORS"));
    }

    return callback(null, true);
  },

  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
});
