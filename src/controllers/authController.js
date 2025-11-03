import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUsuarioByEmail,
  saveRefreshToken,
  deleteRefreshToken,
  findRefreshToken,
  saveTokenBlackList,
  updateRefreshTokenExpiration,
} from "../models/authModel.js";

import { getUsuariosById } from "../models/usuariosModel.js";

export async function refreshTokenController(req, res, next) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token não fornecido." });
  }
}

export async function login(req, res, next) {
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
        role: usuario.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      {
        id: usuario.id,
        role: usuario.role,
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
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token inválido" });
    }

    const tokenDB = await findRefreshToken(refreshToken);

    if (!tokenDB) {
      return res
        .status(403)
        .json({ error: "Refresh token inválido ou revogado" });
    }

    const dataAtual = new Date();
    const dataExpiracao = new Date(tokenDB.expiracao);

    if (dataExpiracao <= dataAtual) {
      await deleteRefreshToken(refreshToken);
      return res.status(403).json({ error: "Refresh token expirado" });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const usuario = await getUsuariosById(payload.id);

    if (!usuario) {
      return res
        .status(404)
        .json({ error: "Usuário associado ao token não encontrado." });
    }

    const newAccessToken = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Atualizar expiração do refresh token
    const novaExpiracao = new Date();
    novaExpiracao.setDate(novaExpiracao.getDate() + 7);

    await updateRefreshTokenExpiration(refreshToken, novaExpiracao);

    res.json({
      accessToken: newAccessToken,
      refreshToken: refreshToken, // Retorna o mesmo refresh token
    });
  } catch (err) {
    console.error("[Refresh] Erro:", err);
    next(err);
  }
}

export async function logout(req, res, next) {
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
        return res
          .status(400)
          .json({ error: "Usuário não identificado para logout" });
      }
      await deleteRefreshTokenTokensByUsuarioId(userId);
    } else if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }

    return res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    next(err);
  }
}
