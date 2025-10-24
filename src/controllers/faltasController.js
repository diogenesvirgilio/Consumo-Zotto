import {
  createFalta,
  deleteFalta,
  getFaltas,
  getFaltasByRequisicao,
  updateFalta,
} from "../models/faltasModel.js";

export async function listFaltas(req, res) {
  try {
    const faltas = await getFaltas();
    res.json(faltas);
  } catch (err) {
    next(err);
  }
}

//Busca uma falta por requisição.
export async function findFalta(req, res) {
  try {
    const { requisicao } = req.params;
    const falta = await getFaltasByRequisicao(requisicao);
    if (!falta) {
      return res.status(404).json({ message: "Falta não encontrada" });
    }
    res.json(falta);
  } catch (err) {
    next(err);
  }
}

export async function registerFalta(req, res) {
  try {
    const {
      falta,
      data,
      programacao,
      dia_reuniao,
      requisicao,
      obs,
      materia_prima_id,
      cortador_id,
    } = req.body;
    const newFalta = await createFalta(
      falta,
      data,
      programacao,
      dia_reuniao,
      requisicao,
      obs,
      materia_prima_id,
      cortador_id
    );
    res.status(201).json(newFalta);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateFalta(req, res) {
  try {
    const { id } = req.params;
    const {
      falta,
      data,
      programacao,
      dia_reuniao,
      requisicao,
      obs,
      materia_prima_id,
      cortador_id,
    } = req.body;
    const faltaAtualizada = await updateFalta(
      id,
      falta,
      data,
      programacao,
      dia_reuniao,
      requisicao,
      obs,
      materia_prima_id,
      cortador_id
    );
    if (!faltaAtualizada) {
      return res.status(404).json({ message: "Falta não encontrada" });
    }
    res.json(faltaAtualizada);
  } catch (err) {
    next(err);
  }
}

export async function removeFalta(req, res) {
  try {
    const { id } = req.params;
    await deleteFalta(id);
    res.json({ message: "Cortador removido com sucesso" });
  } catch (err) {
    next(err);
  }
}
