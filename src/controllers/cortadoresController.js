import {
  getCortadores,
  getCortadorById,
  createCortador,
  updateCortador,
  deleteCortador,
} from "../models/cortadoresModel.js";

export async function listCortadores(req, res, next) {
  try {
    const cortadores = await getCortadores();
    res.json(cortadores);
  } catch (err) {
    next(err);
  }
}

export async function findCortador(req, res, next) {
  try {
    const { id } = req.params;
    const cortador = await getCortadorById(id);
    if (!cortador) {
      return res.status(404).json({ message: "Cortador não encontrado" });
    }
    res.json(cortador);
  } catch (err) {
    next(err);
  }
}

export async function registerCortador(req, res, next) {
  try {
    const { nome, nivel_experiencia } = req.body;
    const newCortador = await createCortador(nome, nivel_experiencia);
    res.status(201).json(newCortador);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateCortador(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, nivel_experiencia } = req.body;
    const cortadorAtualizado = await updateCortador(
      id,
      nome,
      nivel_experiencia
    );
    if (!cortadorAtualizado) {
      return res.status(404).json({ message: "Cortador não encontrado" });
    }
    res.json(cortadorAtualizado);
  } catch (err) {
    next(err);
  }
}

export async function removeCortador(req, res, next) {
  try {
    const { id } = req.params;
    await deleteCortador(id);
    res.json({ message: "Cortador removido com sucesso" });
  } catch (err) {
    next(err);
  }
}
