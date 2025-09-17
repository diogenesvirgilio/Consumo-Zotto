import express from "express";
import {
         listCortadores,
         findCortador,
         registerCortador,
         handleUpdateCortador,
         removeCortador
} from "../controllers/cortadoresController.js"; 

const router = express.Router(); 

router.get("/", listCortadores); 
router.get("/:id", findCortador);
router.post("/", registerCortador);
router.put("/:id", handleUpdateCortador);
router.delete("/:id", removeCortador); 

export default router; 