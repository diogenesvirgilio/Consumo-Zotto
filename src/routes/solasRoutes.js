import express from "express";
import { registerSolas, getSolas, getSolaById, buscarSolaComPesos, updateSola } from "../controllers/solasController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { csrfProtection } from "../middlewares/csrfMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getSolas);
router.get("/buscar", authenticateToken, buscarSolaComPesos);
router.get("/:id", authenticateToken, getSolaById);
router.post("/", authenticateToken, csrfProtection, registerSolas);
router.put("/:id", authenticateToken, csrfProtection, updateSola);

export default router;
