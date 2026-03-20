import pool from "../database/db.js";
import { getSolaByNameOrCode } from "../models/solasModel.js";

export async function registerSolas(req, res, next) {
  const client = await pool.connect();
  try {
    const { nome_sola, codigo_sola, data_atualizacao, pesos } = req.body;

    if (!nome_sola || !codigo_sola || !data_atualizacao) {
      return res.status(400).json({
        error:
          "Nome da sola, código da sola e data de atualização são obrigatórios.",
      });
    }

    // Verificar se já existe sola com esse nome ou código
    const solaExistente = await getSolaByNameOrCode(nome_sola, codigo_sola);
    if (solaExistente) {
      const conflictField =
        solaExistente.nome_sola === nome_sola &&
        solaExistente.codigo_sola === codigo_sola
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
      "INSERT INTO solas (nome_sola, codigo_sola, data_atualizacao) VALUES ($1, $2, $3) RETURNING id",
      [nome_sola, codigo_sola, data_atualizacao],
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
