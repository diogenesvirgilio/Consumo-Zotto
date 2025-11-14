import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { hashToken } from "../utils/crypto.js";

import {
  findUsuarioByEmail,
  saveRefreshToken,
  deleteRefreshToken,
  findRefreshToken,
  saveTokenBlackList,
} from "../models/authModel.js";

import { getUsuariosById } from "../models/usuariosModel.js";

// LOGIN

export const login = async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await findUsuarioByEmail(email);
  if (!usuario) return res.status(401).json({ error: "Credenciais inválidas" });

  const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaOk) return res.status(401).json({ error: "Credenciais inválidas" });

  const accessToken = jwt.sign(
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
    { id: usuario.id, role: usuario.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const exp = new Date();
  exp.setDate(exp.getDate() + 7);

  await saveRefreshToken(usuario.id, hashToken(refreshToken), exp);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login ok",
    accessToken,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
  });
};

// REFRESH

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "Token inválido" });

  const tokenHash = hashToken(token);
  const tokenDB = await findRefreshToken(tokenHash);

  if (!tokenDB) return res.status(403).json({ error: "Token revogado" });

  const agora = new Date();
  const exp = new Date(tokenDB.expiracao);

  if (exp <= agora) {
    await deleteRefreshToken(tokenHash);
    return res.status(403).json({ error: "Token expirado" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(403).json({ error: "Token inválido" });
  }

  const usuario = await getUsuariosById(payload.id);
  if (!usuario) return res.status(404).json({ error: "Usuário não existe" });

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

  // invalida o antigo
  await deleteRefreshToken(tokenHash);

  const newRefresh = jwt.sign(
    { id: usuario.id, role: usuario.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const novaExp = new Date();
  novaExp.setDate(novaExp.getDate() + 7);

  await saveRefreshToken(usuario.id, hashToken(newRefresh), novaExp);

  res.cookie("refreshToken", newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken: newAccessToken });
};

// Logout

export const logout = async (req, res) => {
  const rawAuth = req.headers["authorization"];
  const accessToken = rawAuth?.split(" ")[1];
  const { refreshToken, allSessions } = req.body;

  if (!accessToken && !refreshToken)
    return res.status(401).json({ error: "Nada para invalidar" });

  if (accessToken) {
    const decoded = jwt.decode(accessToken);
    const exp = decoded?.exp ? new Date(decoded.exp * 1000) : new Date();
    await saveTokenBlackList(accessToken, exp);
  }

  if (allSessions) {
    const userId = req.usuario?.id;
    if (userId) {
      await deleteRefreshTokenTokensByUsuarioId(userId);
    }
  } else if (refreshToken) {
    await deleteRefreshToken(hashToken(refreshToken));
  }

  res.json({ message: "Sessão encerrada" });
};
