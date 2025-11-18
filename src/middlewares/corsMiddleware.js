import cors from "cors";

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = allowedOriginsEnv
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Requisições sem origin (Postman, mobile, curl)
    if (!origin) return callback(null, true);

    // Se não houver lista, libera tudo (modo desenvolvimento)
    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }

    // Bloqueia se não estiver na lista
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error("Origem não permitida pelo CORS"));
    }

    return callback(null, true);
  },

  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
});
