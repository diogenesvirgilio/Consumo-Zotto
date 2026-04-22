import express from "express";
import {
  listFaltas,
  findFalta,
  registerFalta,
  handleUpdateFalta,
  removeFalta,
} from "../controllers/faltasController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { csrfProtection } from "../middlewares/csrfMiddleware.js";

const router = express.Router();

router.get("/", listFaltas);
router.get("/:requisicao", findFalta);
router.post("/", csrfProtection, registerFalta);
router.put("/:id", csrfProtection, handleUpdateFalta);
router.delete("/:id", csrfProtection, removeFalta);

export default router;
