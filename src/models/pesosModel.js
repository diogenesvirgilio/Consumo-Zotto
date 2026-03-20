import pool from "../database/db.js";

export async function createPesos(sola_id, listaPesos) {
  const query = `
     INSERT INTO pesos (sola_id, numero, peso_sola, peso_soleta) 
     VALUES ($1, $2, $3, $4)
     `;

  for (const item of listaPesos) {
    await pool.query(query, [
      sola_id,
      item.numero,
      item.peso_sola,
      item.peso_soleta,
    ]);
  }
}
