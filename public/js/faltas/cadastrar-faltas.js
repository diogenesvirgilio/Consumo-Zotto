import { BASE_URL } from "../api/config.js";
import { showModalSistema } from "../utils/modalService.js";
import { fetchWithAuth } from "../api/authRefresh.js";
import { carregarFaltas } from "./consulta-faltas.js";

document.addEventListener("DOMContentLoaded", () => {
  carregarMateriasPrima();
  carregarCortadores();

  async function carregarMateriasPrima() {
    const select = document.getElementById("materiaPrima");
    if (!select) return;

    try {
      const response = await fetchWithAuth(`${BASE_URL}/materiaprima`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao carregar matérias primas");
      }

      const materias = await response.json();

      select.innerHTML = "<option selected>Selecione...</option>";

      materias.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.nome || m.descricao || `Matéria #${m.id}`;
        select.appendChild(opt);
      });
    } catch (err) {
      showModalSistema({
        titulo: "Erro",
        conteudo: "Não foi possível carregar matérias-primas.",
      });
    }
  }

  async function carregarCortadores() {
    const select = document.getElementById("cortador");
    if (!select) return;

    try {
      const response = await fetchWithAuth(`${BASE_URL}/cortadores`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao carregar cortadores");
      }

      const cortadores = await response.json();

      select.innerHTML = "<option selected>Selecione...</option>";

      cortadores.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.nome || `Cortador #${m.id}`;
        select.appendChild(opt);
      });
    } catch (err) {
      showModalSistema({
        titulo: "Erro",
        conteudo: "Não foi possível carregar cortadores.",
      });
    }
  }

  const form = document.getElementById("cadastroFaltasForm");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (submitBtn) submitBtn.disabled = true;

    const materiaPrima = document.getElementById("materiaPrima")?.value;
    const cortador = document.getElementById("cortador")?.value;
    const falta = document.getElementById("falta")?.value.trim();
    const dataCadastro = document.getElementById("data")?.value;
    const diaReuniao = document.getElementById("diaReuniao")?.value.trim();
    const programacao = document.getElementById("programacao")?.value.trim();
    const requisicao = document.getElementById("requisicao")?.value.trim();
    const observacao = document.getElementById("observacao")?.value.trim();

    if (
      !falta ||
      !materiaPrima ||
      materiaPrima === "Selecione..." ||
      !dataCadastro
    ) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Preencha todos os campos obrigatórios.",
      });
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    // Validar se falta é um número decimal válido
    const faltaNormalizado = normalizarDecimal(falta);
    if (!validarDecimal(faltaNormalizado)) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Falta deve ser um número válido (ex: 10,5 ou 10.5).",
      });
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    try {
      const response = await fetchWithAuth(`${BASE_URL}/faltas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          materiaPrima: Number(materiaPrima),
          cortador:
            cortador && cortador !== "Selecione..." ? Number(cortador) : null,
          falta: faltaNormalizado,
          data: dataCadastro,
          diaReuniao,
          programacao,
          requisicao,
          obs: observacao,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        form.reset();
        showModalSistema({
          titulo: "Sucesso",
          conteudo: "Falta cadastrada com sucesso!",
        });
        carregarFaltas();
      } else {
        showModalSistema({
          titulo: "Erro",
          conteudo: data.error || data.message || "Erro ao cadastrar.",
        });
      }
    } catch (err) {
      showModalSistema({
        titulo: "Erro",
        conteudo: "Erro !",
      });
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});

function normalizarDecimal(valor) {
  if (!valor) return valor;
  // Remove espaços
  valor = valor.trim();
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
