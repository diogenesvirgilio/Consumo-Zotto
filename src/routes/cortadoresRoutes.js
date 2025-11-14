import express from "express";
import * as cortadoresController from "../controllers/cortadoresController.js";
import { authorizeRoles, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Listagem & consulta
router.get("/", cortadoresController.listCortadores);
router.get("/:id", cortadoresController.findCortador);

// Apenas admin pode cadastrar
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  cortadoresController.registerCortador
);

// Atualização e remoção
router.put("/:id", cortadoresController.handleUpdateCortador);
router.delete("/:id", cortadoresController.removeCortador);

export default router;
