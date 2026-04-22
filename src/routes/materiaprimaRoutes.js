import express from "express";
import {
         listMateriasprima,
         findMateriaprima,
         registerMateriaprima,
         handleUpdateMateriaprima,
         removeMateriaprima
} from "../controllers/materiaprimaController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { csrfProtection } from "../middlewares/csrfMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, listMateriasprima);
router.get("/:id", authenticateToken, findMateriaprima);
router.post("/", authenticateToken, csrfProtection, registerMateriaprima); 
router.put("/:id", authenticateToken, csrfProtection, handleUpdateMateriaprima);
router.delete("/:id", authenticateToken, csrfProtection, removeMateriaprima);

export default router;