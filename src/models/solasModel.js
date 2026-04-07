import pool from "../database/db.js";

export async function getSolaByNameOrCode(nome_sola, codigo_sola) {
  const result = await pool.query(
    "SELECT id, nome_sola, codigo_sola FROM solas WHERE UPPER(nome_sola) = UPPER($1) OR UPPER(codigo_sola) = UPPER($2) LIMIT 1",
    [nome_sola, codigo_sola],
  );
  return result.rows[0] || null;
}

export async function createSolas(nome_sola, codigo_sola, data_atualizacao, material_cunho, material_soleta) {
  const result = await pool.query(
    "INSERT INTO solas (nome_sola, codigo_sola, data_atualizacao, material_cunho, material_soleta) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [nome_sola, codigo_sola, data_atualizacao, material_cunho, material_soleta],
  );
  return result.rows[0].id;
}

export async function getAllSolas() {
  const result = await pool.query(
    "SELECT id, nome_sola, codigo_sola, data_atualizacao, material_cunho, material_soleta FROM solas ORDER BY nome_sola"
  );
  return result.rows;
}

export async function getSolaWithPesosById(sola_id) {
  const result = await pool.query(
    `SELECT 
      s.id, 
      s.nome_sola, 
      s.codigo_sola, 
      s.data_atualizacao, 
      s.material_cunho, 
      s.material_soleta,
      json_agg(
        json_build_object('numero', p.numero, 'peso_sola', p.peso_sola, 'peso_soleta', p.peso_soleta)
        ORDER BY p.numero
      ) FILTER (WHERE p.numero IS NOT NULL) as pesos
    FROM solas s
    LEFT JOIN pesos p ON s.id = p.sola_id
    WHERE s.id = $1
    GROUP BY s.id`,
    [sola_id]
  );
  return result.rows[0] || null;
}

export async function getSolaWithPesos(nome_sola, codigo_sola) {
  let whereClause = "WHERE ";
  let params = [];

  if (nome_sola) {
    whereClause += "UPPER(s.nome_sola) = UPPER($1)";
    params.push(nome_sola);
  }

  if (codigo_sola) {
    if (params.length > 0) whereClause += " OR ";
    whereClause += `UPPER(s.codigo_sola) = UPPER($${params.length + 1})`;
    params.push(codigo_sola);
  }

  const result = await pool.query(
    `SELECT 
      s.id, 
      s.nome_sola, 
      s.codigo_sola, 
      s.data_atualizacao, 
      s.material_cunho, 
      s.material_soleta,
      json_agg(
        json_build_object('numero', p.numero, 'peso_sola', p.peso_sola, 'peso_soleta', p.peso_soleta)
        ORDER BY p.numero
      ) FILTER (WHERE p.numero IS NOT NULL) as pesos
    FROM solas s
    LEFT JOIN pesos p ON s.id = p.sola_id
    ${whereClause}
    GROUP BY s.id
    LIMIT 1`,
    params
  );
  return result.rows[0] || null;
}

export async function updateSolaWithPesos(sola_id, data_atualizacao, material_cunho, material_soleta) {
  const result = await pool.query(
    `UPDATE solas 
     SET data_atualizacao = $1, material_cunho = $2, material_soleta = $3
     WHERE id = $4
     RETURNING id`,
    [data_atualizacao, material_cunho, material_soleta, sola_id]
  );
  return result.rows[0] || null;
}

export async function deletePesos(sola_id) {
  await pool.query("DELETE FROM pesos WHERE sola_id = $1", [sola_id]);
}
