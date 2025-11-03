import {
  getMateriaprima,
  getMateriaprimaById,
  createMateriaprima,
  updateMateriaprima,
  deleteMateriaprima,
} from "../models/materiaprimaModel.js";

export async function listMateriasprima(req, res, next) {
  try {
    const materiaprima = await getMateriaprima();
    res.json(materiaprima);
  } catch (err) {
    next(err);
  }
}

export async function findMateriaprima(req, res, next) {
  try {
    const { id } = req.params;
    const materiaprima = await getMateriaprimaById(id);
    if (!materiaprima) {
      return res.status(404).json({ message: "Matéria prima não encontrado" });
    }
    res.json(materiaprima);
  } catch (err) {
    next(err);
  }
}

export async function registerMateriaprima(req, res, next) {
  try {
    const { nome } = req.body;
    const newMateriaprima = await createMateriaprima(nome);
    res.status(201).json(newMateriaprima);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateMateriaprima(req, res, next) {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    const materiaprimaAtualizada = await updateMateriaprima(id, nome);
    if (!materiaprimaAtualizada) {
      return res.status(404).json({ message: "Materia Prima não encontrada" });
    }
    res.json(materiaprimaAtualizada);
  } catch (err) {
    next(err);
  }
}

export async function removeMateriaprima(req, res, next) {
  try {
    const { id } = req.params;
    await deleteMateriaprima(id);
    res.json({ message: "Matéria Prima removida com sucesso" });
  } catch (err) {
    next(err);
  }
}
