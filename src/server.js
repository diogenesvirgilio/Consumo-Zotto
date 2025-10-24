import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import sanitize from "express-mongo-sanitize";
import "./database/db.js";
import cortadoresRoutes from "./routes/cortadoresRoutes.js";
import materiaprimaRoutes from "./routes/materiaprimaRoutes.js";
import faltasRoutes from "./routes/faltasRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { authenticateToken } from "./middlewares/authMiddleware.js";
import { logRequest } from "./models/authModel.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(","),
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 horas
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.body) {
    sanitize.sanitize(req.body);
  }
  if (req.params) {
    sanitize.sanitize(req.params);
  }
  next();
});

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/login.html"));
});

app.use("/cortadores", authenticateToken, logRequest, cortadoresRoutes);
app.use("/materiaprima", materiaprimaRoutes);
app.use("/faltas", faltasRoutes);
app.use("/usuarios", authenticateToken, logRequest, usuariosRoutes);
app.use("/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
