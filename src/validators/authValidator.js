import { body, validationResult } from "express-validator";

export const registerValidation = [
    body("nome").notEmpty().withMessage("Nome é obrigatório"),
    body("email").isEmail().withMessage("Email inválido"),
    body("senha").isLength({ min: 6 }).withMessage("Senha deve ter pelo 6 caracteres"),
    body("role").optional().isIn(["user", "admin"]).withMessage("Role inválida")
]; 

export const loginValidation = [
    body("email").isEmail().withMessage("Email inválido"),
    body("senha").isLength({ min: 6 }).withMessage("Senha deve ter pelo 6 caracteres")
]; 

export function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}