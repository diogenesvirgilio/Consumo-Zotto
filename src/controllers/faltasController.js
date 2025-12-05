import {
  createFalta,
  deleteFalta,
  getFaltas,
  getFaltasByRequisicao,
  updateFalta,
} from "../models/faltasModel.js";

export async function listFaltas(req, res, next) {
  try {
    const faltas = await getFaltas();
    res.json(faltas);
  } catch (err) {
    next(err);
  }
}

export async function findFalta(req, res, next) {
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

export async function registerFalta(req, res, next) {
  try {
    const dados = req.body;
    const faltaNormalizado = normalizarDecimal(dados.falta);

    // Validar formato decimal
    if (!validarDecimal(faltaNormalizado)) {
      return res.status(400).json({
        error: "Falta deve ser um número decimal válido (ex: 10.5)",
      });
    }

    const newFalta = await createFalta({
      falta: faltaNormalizado,
      data: dados.data,
      programacao: dados.programacao,
      diaReuniao: dados.diaReuniao,
      requisicao: dados.requisicao,
      obs: dados.obs,
      materiaPrimaId: Number(dados.materiaPrima),
      cortadorId: Number(dados.cortador),
    });

    res.status(201).json(newFalta);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateFalta(req, res, next) {
  try {
    const { id } = req.params;
    const dados = req.body;
    const faltaNormalizado = normalizarDecimal(dados.falta);

    // Validar formato decimal
    if (!validarDecimal(faltaNormalizado)) {
      return res.status(400).json({
        error: "Falta deve ser um número decimal válido (ex: 10.5)",
      });
    }

    const faltaAtualizada = await updateFalta(id, {
      falta: faltaNormalizado,
      data: dados.data,
      programacao: dados.programacao,
      diaReuniao: dados.diaReuniao,
      requisicao: dados.requisicao,
      obs: dados.obs,
      materiaPrimaId: dados.materiaPrimaId,
      cortadorId: dados.cortadorId,
    });

    if (!faltaAtualizada) {
      return res.status(404).json({ message: "Falta não encontrada" });
    }

    res.json(faltaAtualizada);
  } catch (err) {
    next(err);
  }
}

export async function removeFalta(req, res, next) {
  try {
    const { id } = req.params;
    await deleteFalta(id);

    res.json({ message: "Falta removida com sucesso" });
  } catch (err) {
    next(err);
  }
}

function normalizarDecimal(valor) {
  if (!valor) return valor;
  // Remove espaços
  valor = valor.toString().trim();
  // Remove pontos (separadores de milhares)
  valor = valor.replace(/\./g, "");
  // Substitui vírgula por ponto (separador decimal)
  valor = valor.replace(",", ".");
  return valor;
}

function validarDecimal(valor) {
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(valor.toString());
}
