import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createUsuario,
  deleteUsuario,
  getUsuarioByEmail,
  getUsuarios,
  getUsuariosById,
  updateUsuario,
} from "../models/usuariosModel.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export async function listUsuarios(req, res, next) {
  try {
    const usuarios = await getUsuarios();
    const usuariosSemSenha = usuarios.map((u) => {
      const { senha_hash, ...rest } = u;
      return rest;
    });
    res.json(usuariosSemSenha);
  } catch (err) {
    next(err);
  }
}

export async function findUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const usuario = await getUsuariosById(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    const { senha_hash, ...usuariosSemSenha } = usuario;
    res.json(usuariosSemSenha);
  } catch (err) {
    next(err);
  }
}

export async function registerUsuario(req, res, next) {
  try {
    const { nome, email, senha, role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Categoria inválida." });
    }
    const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);
    const newUsuario = await createUsuario(nome, email, senha_hash, role);
    const { senha_hash: _, ...usuariosSemSenha } = newUsuario;
    res.status(201).json(usuariosSemSenha);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, email, senha, role } = req.body;

    if (req.usuario.role !== "admin") {
      return res.status(403).json({ message: "Acesso negado." });
    }
    let senha_hash;
    if (senha) {
      senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);
    } else {
      const usuarioAtual = await getUsuariosById(id);
      if (!usuarioAtual) {
        return res.status(404).json({ message: "usuário não encontrado" });
      }
      senha_hash = usuarioAtual.senha_hash;
    }

    const usuarioAtualizado = await updateUsuario(
      id,
      nome,
      email,
      senha_hash,
      role
    );
    if (!usuarioAtualizado) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    const { senha_hash: _, ...usuariosSemSenha } = usuarioAtualizado;
    res.json(usuariosSemSenha);
  } catch (err) {
    next(err);
  }
}

export async function removeUsuario(req, res, next) {
  try {
    const { id } = req.params;
    await deleteUsuario(id);
    res.json({ message: "Usuário removido com sucesso" });
  } catch (err) {
    next(err);
  }
}
