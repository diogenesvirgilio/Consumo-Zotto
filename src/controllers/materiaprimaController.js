import {
  getMateriaprima,
  getMateriaprimaById,
  createMateriaprima,
  updateMateriaprima,
  deleteMateriaprima,
} from "../models/materiaprimaModel.js";
import {
  validateNomeMateriaprima,
  checkDuplicateMateriaprimaName,
} from "../validators/materiaprimaValidator.js";

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

    const validationErrors = await validateNomeMateriaprima(nome);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors[0] });
    }

    const isDuplicate = await checkDuplicateMateriaprimaName(nome);
    if (isDuplicate) {
      return res.status(409).json({
        error: "Já existe uma matéria prima com este nome",
      });
    }

    const newMateriaprima = await createMateriaprima(nome.trim());
    res.status(201).json(newMateriaprima);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateMateriaprima(req, res, next) {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    const validationErrors = await validateNomeMateriaprima(nome);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors[0] });
    }

    const isDuplicate = await checkDuplicateMateriaprimaName(nome, id);
    if (isDuplicate) {
      return res.status(409).json({
        error: "Cadastro existente. Tente outro.",
      });
    }

    const materiaprimaAtualizada = await updateMateriaprima(id, nome.trim());
    if (!materiaprimaAtualizada) {
      return res.status(404).json({ message: "Matéria Prima não encontrada" });
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
