import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { 
         findUsuarioByEmail, 
         saveRefreshToken,
         deleteRefreshToken,
         findRefreshToken,
         saveTokenBlackList
} from "../models/authModel.js";

export async function login(req, res) {
    try {
        const { email, senha } = req.body;

        const usuario = await findUsuarioByEmail(email);
        if (!usuario) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        } 

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ error: "Senha inválida" });
        }    
        
        const token = jwt.sign(
            { 
                id: usuario.id, 
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { 
                id: usuario.id, 
                role: usuario.role
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        ); 

        const expiracao = new Date();
        expiracao.setDate(expiracao.getDate() + 7);

        await saveRefreshToken(usuario.id, refreshToken, expiracao);
        
        res.json({
            message: "Login realizado com sucesso",
            accessToken: token,
            refreshToken,
            usuario: {
                id:    usuario.id,
                nome:  usuario.nome,
                email: usuario.email,
                role:  usuario.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Erro interno no servidor" }); 
    }
} 

export async function refresh(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ error: "Refresh token inválido" });
        }
        
        const tokenDB = await findRefreshToken(refreshToken);
        
        if (!tokenDB) {
            return res.status(403).json({ error: "Refresh token inválido ou revogado" });
        }
        
        if (new Date(tokenDB.expiracao) <= new Date()) {
            await deleteRefreshToken(refreshToken);
            return res.status(403).json({ error: "Refresh token expirado" }); 
        } 
        
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
            const newAccessToken = jwt.sign(
                { 
                    id: payload.id,
                    nome: payload.nome,
                    email: payload.email, 
                    role: payload.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
            );
            res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(500).json({ error: "Erro ao renovar token" });
    }
}

export async function logout(req, res) {
    try {
        const authHeader = req.headers["authorization"];
        const accessToken = authHeader && authHeader.split(" ")[1];
        const { refreshToken, allSessions } = req.body;

        if (!accessToken && !refreshToken) {
            return res.status(401).json({ error: "Token não fornecido para logout" });
        }
        
        if (accessToken) {
            const decoded = jwt.decode(accessToken);
            const expDate =
                decoded && decoded.exp 
                ? new Date(decoded.exp * 1000)
                : new Date(Date.now() + 15 * 60 * 1000); // fallback 15m
            await saveTokenBlackList(accessToken, expDate);
        } 

        if (allSessions) {
            const userId = req.usuario?.id;
            if (!userId) {
                return res.status(400).json({ error: "Usuário não identificado para logout"})
            }
            await deleteRefreshTokenTokensByUsuarioId(userId);
        } else if (refreshToken) {
            await deleteRefreshToken(refreshToken);
        } 
        
        return res.json({ message: "Logout realizado com sucesso" });

    } catch (err) {
        res.status(500).json({ error: "Erro interno no logout" });
    }
}