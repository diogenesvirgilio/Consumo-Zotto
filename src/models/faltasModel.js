import pool from "../database/db.js"; 

export async function getFaltas() {
    const result = await pool.query("SELECT * FROM faltas ORDER BY id ASC");
    return result.rows;
} 

//Busca uma falta por requisição.
export async function getFaltasByRequisicao(requisicao) {
    const result = await pool.query("SELECT * FROM faltas WHERE requisicao = $1", [requisicao]);
    return result.rows[0];
} 

export async function createFalta(falta, data, programacao, dia_reuniao, requisicao, obs, materia_prima_id, cortador_id) {
    const result = await pool.query(
        "INSERT INTO faltas (falta, data, programacao, dia_reuniao, requisicao, obs, materia_prima_id,   cortador_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", 
        [falta, data, programacao, dia_reuniao, requisicao, obs, materia_prima_id, cortador_id]
    );
    return result.rows[0];
} 

export async function updateFalta(id, falta, data, programacao, dia_reuniao, requisicao, obs, materia_prima_id, cortador_id) {
    const result = await pool.query(
        "UPDATE faltas SET falta = $1, data = $2, programacao = $3, dia_reuniao = $4, requisicao = $5, obs = $6, materia_prima_id = $7,   cortador_id = $8 WHERE id = $9 RETURNING *", 
        [ falta, data, programacao, dia_reuniao, requisicao, obs, materia_prima_id, cortador_id, id]
    );
    return result.rows[0];
} 

export async function deleteFalta(id) {
    await pool.query("DELETE FROM faltas WHERE id = $1", [id]);
    return { message: "Falta deletada com sucesso" };
}
