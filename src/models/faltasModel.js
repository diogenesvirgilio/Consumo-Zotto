import pool from "../database/db.js";

export async function getFaltas() {
  const query = `
  SELECT 
    f.*,
    mp.nome AS materia_prima_nome,
    c.nome AS cortador_nome
  FROM faltas f
  LEFT JOIN materia_prima mp ON mp.id = f.materia_prima_id 
  LEFT JOIN cortadores c ON c.id = f.cortador_id
  ORDER BY f.id ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
}

export async function getFaltasByRequisicao(requisicao) {
  const { rows } = await pool.query(
    "SELECT * FROM faltas WHERE requisicao = $1",
    [requisicao]
  );
  return rows[0] || null;
}

export async function createFalta({
  falta,
  data,
  programacao,
  diaReuniao,
  requisicao,
  obs,
  materiaPrimaId,
  cortadorId,
}) {
  const query = `
    INSERT INTO faltas 
    (falta, data, programacao, dia_reuniao, requisicao, obs, materia_prima_id, cortador_id) 
    VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8) 
    
    RETURNING * 
    `;
  const values = [
    falta,
    data,
    programacao,
    diaReuniao,
    requisicao,
    obs,
    materiaPrimaId,
    cortadorId,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

export async function updateFalta(
  id,
  {
    falta,
    data,
    programacao,
    diaReuniao,
    requisicao,
    obs,
    materiaPrimaId,
    cortadorId,
  }
) {
  const query = `
    UPDATE faltas 
    SET falta = $1, 
    data = $2, 
    programacao = $3, 
    dia_reuniao = $4, 
    requisicao = $5, 
    obs = $6, 
    materia_prima_id = $7,   
    cortador_id = $8 
    WHERE id = $9 
    RETURNING *
    `;
  const values = [
    falta,
    data,
    programacao,
    diaReuniao,
    requisicao,
    obs,
    materiaPrimaId,
    cortadorId,
    id,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

export async function deleteFalta(id) {
  await pool.query("DELETE FROM faltas WHERE id = $1", [id]);
}
