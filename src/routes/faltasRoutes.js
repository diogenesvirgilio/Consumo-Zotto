import express from "express";
import {
  listFaltas,
  findFalta,
  registerFalta,
  handleUpdateFalta,
  removeFalta,
} from "../controllers/faltasController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, listFaltas);
router.get("/:requisicao", authenticateToken, findFalta);
router.post("/", authenticateToken, registerFalta);
router.put("/:id", authenticateToken, handleUpdateFalta);
router.delete("/:id", authenticateToken, removeFalta);

export default router;
