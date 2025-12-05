export function validateFalta(dados) {
  const errors = [];

  // Campos obrigatórios
  if (!dados.falta || String(dados.falta).trim() === "") {
    errors.push("Falta (quantidade) é obrigatória");
  } else if (isNaN(parseFloat(dados.falta))) {
    errors.push("Falta deve ser um número válido");
  }

  if (!dados.data || String(dados.data).trim() === "") {
    errors.push("Data de cadastro é obrigatória");
  } else if (isNaN(Date.parse(dados.data))) {
    errors.push("Data deve ser um formato válido (YYYY-MM-DD)");
  }

  if (!dados.materiaPrimaId || isNaN(parseInt(dados.materiaPrimaId))) {
    errors.push("Matéria Prima é obrigatória e deve ser um número");
  }

  // Campos opcionais (apenas validação de tipo se fornecidos)
  if (dados.cortadorId && isNaN(parseInt(dados.cortadorId))) {
    errors.push("Cortador deve ser um número válido");
  }

  if (dados.programacao && typeof dados.programacao !== "string") {
    errors.push("Programação deve ser um texto válido");
  }

  if (dados.diaReuniao && typeof dados.diaReuniao !== "string") {
    errors.push("Dia Reunião deve ser um texto válido");
  }

  if (dados.requisicao && typeof dados.requisicao !== "string") {
    errors.push("Requisição deve ser um texto válido");
  }

  if (dados.obs && typeof dados.obs !== "string") {
    errors.push("Observação deve ser um texto válido");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
