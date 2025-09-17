import express from "express";
import {
         listMateriasprima,
         findMateriaprima,
         registerMateriaprima,
         handleUpdateMateriaprima,
         removeMateriaprima
} from "../controllers/materiaprimaController.js"; 

const router = express.Router();

router.get("/", listMateriasprima);
router.get("/:id", findMateriaprima);
router.post("/", registerMateriaprima); 
router.put("/:id", handleUpdateMateriaprima);
router.delete("/:id", removeMateriaprima);

export default router;