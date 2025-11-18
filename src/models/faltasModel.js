import pool from "../database/db.js";

export async function getFaltas() {
  const { rows } = await pool.query("SELECT * FROM faltas ORDER BY id ASC");
  return rows;
}

//Busca uma falta por requisição.
export async function getFaltasByRequisicao(requisicao) {
  const { rows } = await pool.query(
    "SELECT * FROM faltas WHERE requisicao = $1",
    [requisicao]
  );
  return rows[0];
}

export async function createFalta(data) {
  const {
    falta,
    data: dataFalta,
    programacao,
    dia_reuniao,
    requisicao,
    obs,
    materia_prima_id,
    cortador_id,
  } = data;

  const query = `
    "INSERT INTO faltas 
    (falta, data, programacao, dia_reuniao, requisicao, obs, materia_prima_id, cortador_id) 
    VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8) 
    
    RETURNING * 
    `;
  const values = [
    falta,
    data,
    programacao,
    dia_reuniao,
    requisicao,
    obs,
    materia_prima_id,
    cortador_id,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function updateFalta(id, data) {
  const {
    falta,
    data: dataFalta,
    programacao,
    dia_reuniao,
    requisicao,
    obs,
    materia_prima_id,
    cortador_id,
  } = data;

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
    dia_reuniao,
    requisicao,
    obs,
    materia_prima_id,
    cortador_id,
    id,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

export async function deleteFalta(id) {
  await pool.query("DELETE FROM faltas WHERE id = $1", [id]);
}
