import express from "express";
import * as usuariosController from "../controllers/usuariosController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

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
  usuariosController.registerUsuario,
);

router.put("/:id", usuariosController.handleUpdateUsuario);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  usuariosController.removeUsuario,
);

export default router;
