import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../models/authModel.js";

export async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; 

    if (!token) {
        return res.status(401).json({ error: "Token não fornecido" });
    } 

    if (await isTokenBlacklisted(token)) {
        return res.status(401).json({ error: "Sessão expirada ou token revogado" });
    } 
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token inválido" });
    }    
          
}

export function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token não fornecido"})

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token inválido" });
        req.usuario = decoded;
        next();
    });
} 

export function authorizeRoles(...rolesPermitidos) {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario.role)) {
            return res.status(403).json({ error: "Acesso negado" });
        }
        next();
    }
}