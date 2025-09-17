import express from "express";
import * as usuariosController from "../controllers/usuariosController.js"; 
import { authenticateToken, verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router(); 

router.get("/", verifyToken, authenticateToken, usuariosController.listUsuarios); 
router.get("/:id", authenticateToken, usuariosController.findUsuario);
router.post("/", verifyToken, authorizeRoles("admin"), authenticateToken, usuariosController.registerUsuario);
router.put("/:id", usuariosController.handleUpdateUsuario);
router.delete("/:id", verifyToken, authorizeRoles("admin"), authenticateToken, usuariosController.removeUsuario);
router.post("/login", usuariosController.loginUsuario);

export default router;
