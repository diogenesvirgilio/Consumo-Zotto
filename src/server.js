import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

import "./database/db.js";
import cortadoresRoutes from "./routes/cortadoresRoutes.js";
import materiaprimaRoutes from "./routes/materiaprimaRoutes.js";
import faltasRoutes from "./routes/faltasRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { authenticateToken } from "./middlewares/authMiddleware.js";
import { logRequest } from "./models/authModel.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.COR_ORIGIN || "*" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/login.html"));
});

app.use("/cortadores", authenticateToken, logRequest, cortadoresRoutes);
app.use("/materiaprima", materiaprimaRoutes);
app.use("/faltas", faltasRoutes);
app.use("/usuarios", authenticateToken, logRequest, usuariosRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
