import pool from "../database/db.js";
import {
  getSolaByNameOrCode,
  getAllSolas,
  getSolaWithPesos,
  getSolaWithPesosById,
  updateSolaWithPesos,
  deletePesos,
} from "../models/solasModel.js";

export async function registerSolas(req, res, next) {
  const client = await pool.connect();
  try {
    const {
      nome_sola,
      codigo_sola,
      data_atualizacao,
      material_cunho,
      material_soleta,
      pesos,
    } = req.body;

    if (!nome_sola || !codigo_sola || !data_atualizacao) {
      return res.status(400).json({
        error:
          "Nome da sola, código da sola e data de atualização são obrigatórios.",
      });
    }

    const codigo_sola_normalizado = codigo_sola.toUpperCase();

    // Verificar se já existe sola com esse nome ou código
    const solaExistente = await getSolaByNameOrCode(
      nome_sola,
      codigo_sola_normalizado,
    );
    if (solaExistente) {
      const conflictField =
        solaExistente.nome_sola === nome_sola &&
        solaExistente.codigo_sola === codigo_sola_normalizado
          ? "Nome e código"
          : solaExistente.nome_sola === nome_sola
            ? "Nome"
            : "Código";

      return res.status(409).json({
        error: `${conflictField} da sola já existe no cadastro.`,
        conflictField: conflictField.toLowerCase(),
      });
    }

    // Iniciar transação
    await client.query("BEGIN");

    // Inserir sola
    const solaResult = await client.query(
      "INSERT INTO solas (nome_sola, codigo_sola, data_atualizacao, material_cunho, material_soleta) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [
        nome_sola,
        codigo_sola_normalizado,
        data_atualizacao,
        material_cunho,
        material_soleta,
      ],
    );

    const solaId = solaResult.rows[0].id;

    // Inserir pesos
    if (pesos && pesos.length > 0) {
      const pesosQuery = `
        INSERT INTO pesos (sola_id, numero, peso_sola, peso_soleta) 
        VALUES ($1, $2, $3, $4)
      `;

      for (const item of pesos) {
        await client.query(pesosQuery, [
          solaId,
          item.numero,
          item.peso_sola,
          item.peso_soleta,
        ]);
      }
    }

    await client.query("COMMIT");

    res.status(201).json({ id: solaId });
  } catch (err) {
    // Reverter transação em caso de erro
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Erro ao fazer ROLLBACK:", rollbackErr);
    }
    next(err);
  } finally {
    client.release();
  }
}

export async function getSolas(req, res, next) {
  try {
    const solas = await getAllSolas();
    res.status(200).json(solas);
  } catch (err) {
    next(err);
  }
}

export async function getSolaById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "ID da sola é obrigatório.",
      });
    }

    const sola = await getSolaWithPesosById(id);

    if (!sola) {
      return res.status(404).json({
        error: "Sola não encontrada.",
      });
    }

    res.status(200).json(sola);
  } catch (err) {
    next(err);
  }
}

export async function buscarSolaComPesos(req, res, next) {
  try {
    const { nome_sola, codigo_sola } = req.query;

    if (!nome_sola && !codigo_sola) {
      return res.status(400).json({
        error: "Informe nome_sola ou codigo_sola para buscar.",
      });
    }

    // Normalizar código_sola para maiúsculas se fornecido
    const codigo_sola_normalizado = codigo_sola
      ? codigo_sola.toUpperCase()
      : "";

    const sola = await getSolaWithPesos(
      nome_sola || "",
      codigo_sola_normalizado,
    );

    if (!sola) {
      return res.status(404).json({
        error: "Sola não encontrada.",
      });
    }

    res.status(200).json(sola);
  } catch (err) {
    next(err);
  }
}

export async function updateSola(req, res, next) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { data_atualizacao, material_cunho, material_soleta, pesos } =
      req.body;

    if (!id || !data_atualizacao) {
      return res.status(400).json({
        error: "ID da sola e data de atualização são obrigatórios.",
      });
    }

    // Iniciar transação
    await client.query("BEGIN");

    // Atualizar sola
    const solaResult = await client.query(
      "UPDATE solas SET data_atualizacao = $1, material_cunho = $2, material_soleta = $3 WHERE id = $4 RETURNING id",
      [data_atualizacao, material_cunho, material_soleta, id],
    );

    if (solaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Sola não encontrada.",
      });
    }

    // Deletar pesos antigos
    await client.query("DELETE FROM pesos WHERE sola_id = $1", [id]);

    // Inserir novos pesos
    if (pesos && pesos.length > 0) {
      const pesosQuery = `
        INSERT INTO pesos (sola_id, numero, peso_sola, peso_soleta) 
        VALUES ($1, $2, $3, $4)
      `;

      for (const item of pesos) {
        await client.query(pesosQuery, [
          id,
          item.numero,
          item.peso_sola,
          item.peso_soleta,
        ]);
      }
    }

    await client.query("COMMIT");

    res.status(200).json({ id });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Erro ao fazer ROLLBACK:", rollbackErr);
    }
    next(err);
  } finally {
    client.release();
  }
}
