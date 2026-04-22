import express from "express";
import * as cortadoresController from "../controllers/cortadoresController.js";
import { authorizeRoles, verifyToken } from "../middlewares/authMiddleware.js";
import { csrfProtection } from "../middlewares/csrfMiddleware.js";

const router = express.Router();

// Listagem & consulta
router.get("/", cortadoresController.listCortadores);
router.get("/:id", cortadoresController.findCortador);

// Apenas admin pode cadastrar
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  csrfProtection,
  cortadoresController.registerCortador
);

// Atualização e remoção
router.put(
  "/:id",
  verifyToken,
  csrfProtection,
  cortadoresController.handleUpdateCortador
);
router.delete(
  "/:id",
  verifyToken,
  csrfProtection,
  cortadoresController.removeCortador
);

export default router;
