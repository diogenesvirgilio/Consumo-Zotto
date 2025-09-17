import express from "express";
import * as authController from "../controllers/authController.js"; 
import { loginValidation, validateRequest } from "../validators/authValidator.js";

const router = express.Router();

router.post("/login", loginValidation, validateRequest, authController.login); 
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);


export default router;