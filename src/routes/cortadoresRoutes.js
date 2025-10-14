import express from "express";
import * as cortadoresController from "../controllers/cortadoresController.js";
import {
  authenticateToken,
  authorizeRoles,
  verifyToken,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", cortadoresController.listCortadores);
router.get("/:id", cortadoresController.findCortador);
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  authenticateToken,
  cortadoresController.registerCortador
);
router.put("/:id", cortadoresController.handleUpdateCortador);
router.delete("/:id", cortadoresController.removeCortador);

export default router;
