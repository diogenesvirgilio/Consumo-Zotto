import express from "express";
import rateLimit from "express-rate-limit";

import * as authController from "../controllers/authController.js";
import {
  loginValidation,
  validateRequest,
} from "../validators/authValidator.js";

const router = express.Router();

// Limite para tentativas de login (evita força bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite para refresh token
const refreshLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 houras
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Rotas
router.post(
  "/login",
  loginLimiter,
  loginValidation,
  validateRequest,
  authController.login
);

router.post("/refresh", refreshLimiter, authController.refresh);
router.post("/logout", authController.logout);

export default router;
