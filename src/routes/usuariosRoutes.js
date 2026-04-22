import express from "express";
import * as usuariosController from "../controllers/usuariosController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";
import { csrfProtection } from "../middlewares/csrfMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  usuariosController.listUsuarios,
);

router.get("/:id", authenticateToken, usuariosController.findUsuario);

// Criar usuário — apenas admin
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  csrfProtection,
  usuariosController.registerUsuario,
);

router.put(
  "/:id",
  authenticateToken,
  csrfProtection,
  usuariosController.handleUpdateUsuario,
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  csrfProtection,
  usuariosController.removeUsuario,
);

export default router;
