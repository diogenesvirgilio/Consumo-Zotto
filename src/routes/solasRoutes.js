import express from "express";
import { registerSolas } from "../controllers/solasController.js";

const router = express.Router();

router.post("/", registerSolas);

export default router;
