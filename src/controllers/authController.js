import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { hashToken } from "../utils/crypto.js";
import { asyncHandler } from "../utils/asyncHandler.js";
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

export const login = asyncHandler(async (req, res) => {
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

  // Salvar apenas o hash do refresh token no banco
  const refreshHash = hashToken(refreshToken);
  await saveRefreshToken(usuario.id, refreshHash, expiracao);

  // Enviar refresh token como cookie httpOnly
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true em produção
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  });

  res.json({
    message: "Login realizado com sucesso",
    accessToken: token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token inválido" });
  }

  // Procurar pelo hash do token recebido
  const incomingHash = hashToken(refreshToken);
  const tokenDB = await findRefreshToken(incomingHash);

  if (!tokenDB) {
    return res
      .status(403)
      .json({ error: "Refresh token inválido ou revogado" });
  }

  const dataAtual = new Date();
  const dataExpiracao = new Date(tokenDB.expiracao);

  if (dataExpiracao <= dataAtual) {
    // remover pelo hash (refreshToken é o raw token)
    await deleteRefreshToken(incomingHash);
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

  // Invalidar o refresh token antigo e emitir um novo
  await deleteRefreshToken(incomingHash);

  const nextRefreshToken = jwt.sign(
    { id: usuario.id, role: usuario.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  const novaExpiracao = new Date();
  novaExpiracao.setDate(novaExpiracao.getDate() + 7);
  const nextHash = hashToken(nextRefreshToken);
  await saveRefreshToken(usuario.id, nextHash, novaExpiracao);

  res.cookie("refreshToken", nextRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    accessToken: newAccessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
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
    const refreshHash = hashToken(refreshToken);
    await deleteRefreshToken(refreshHash);
  }

  return res.json({ message: "Logout realizado com sucesso" });
});
