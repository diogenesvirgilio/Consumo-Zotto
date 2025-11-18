import express from "express";
import * as usuariosController from "../controllers/usuariosController.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Listar usuários — apenas admins
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  usuariosController.listUsuarios
);

// Buscar usuário por ID — admin ou o próprio usuário.
router.get("/:id", authenticateToken, usuariosController.findUsuario);

// Criar usuário — apenas admin
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  usuariosController.registerUsuario
);

// Atualizar usuário — admin ou o próprio perfil
router.put("/:id", usuariosController.handleUpdateUsuario);

// Deletar usuário — apenas admin
router.delete(
  "/:id",
  authorizeRoles("admin"),
  usuariosController.removeUsuario
);

export default router;
