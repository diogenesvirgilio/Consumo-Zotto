import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import "./database/db.js";

import cortadoresRoutes from "./routes/cortadoresRoutes.js";
import materiaprimaRoutes from "./routes/materiaprimaRoutes.js";
import faltasRoutes from "./routes/faltasRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { authenticateToken } from "./middlewares/authMiddleware.js";
import { logRequest } from "./middlewares/logRequest.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { corsMiddleware } from "./middlewares/corsMiddleware.js";
import { sanitizeMiddleware } from "./middlewares/sanitizeMiddleware.js";

import logger from "./utils/logger.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares globais
app.disable("x-powered-by");
app.use(corsMiddleware);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);

app.use(express.static(path.join(__dirname, "../public")));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  })
);

// Rotas públicas
app.use("/auth", authRoutes);

// Página inicial (pública)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/login.html"));
});

// Middleware de auth + log (somente rotas privadas)
app.use(authenticateToken, logRequest);

// Rotas privadas
app.use("/cortadores", cortadoresRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/materiaprima", materiaprimaRoutes);
app.use("/faltas", faltasRoutes);

// Error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => logger.info(`Servidor rodando na porta ${PORT}`));
}

export default app;
