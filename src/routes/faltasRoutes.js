import express from "express"; 
import {
         listFaltas,
         findFalta,
         registerFalta,
         handleUpdateFalta,
         removeFalta
} from "../controllers/faltasController.js"; 

const router = express.Router(); 

router.get("/", listFaltas); 
router.get("/:requisicao", findFalta);
router.post("/", registerFalta);
router.put("/:id", handleUpdateFalta);
router.delete("/:id", removeFalta);

export default router;