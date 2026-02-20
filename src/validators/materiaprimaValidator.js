import pool from "../database/db.js";

export async function validateNomeMateriaprima(nome) {
  const errors = [];

  if (!nome || typeof nome !== "string") {
    errors.push("Nome é obrigatório");
    return errors;
  }

  const trimmedNome = nome.trim();
  if (trimmedNome.length === 0) {
    errors.push("Nome não pode estar vazio");
    return errors;
  }

  if (trimmedNome.length > 150) {
    errors.push("Nome não pode ter mais de 150 caracteres");
    return errors;
  }

  return errors;
}

export async function checkDuplicateMateriaprimaName(nome, excludeId = null) {
  const query = excludeId
    ? "SELECT id FROM materia_prima WHERE LOWER(nome) = LOWER($1) AND id != $2"
    : "SELECT id FROM materia_prima WHERE LOWER(nome) = LOWER($1)";

  const params = excludeId ? [nome.trim(), excludeId] : [nome.trim()];
  const result = await pool.query(query, params);

  return result.rows.length > 0;
}
