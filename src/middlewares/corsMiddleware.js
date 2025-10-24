import cors from "cors";

export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(",") || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 horas
};

export const corsMiddleware = cors(corsOptions);
