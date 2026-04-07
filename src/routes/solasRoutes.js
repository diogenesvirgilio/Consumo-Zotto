import express from "express";
import { registerSolas, getSolas, getSolaById, buscarSolaComPesos, updateSola } from "../controllers/solasController.js";

const router = express.Router();

router.get("/", getSolas);
router.get("/buscar", buscarSolaComPesos);
router.get("/:id", getSolaById);
router.post("/", registerSolas);
router.put("/:id", updateSola);

export default router;
