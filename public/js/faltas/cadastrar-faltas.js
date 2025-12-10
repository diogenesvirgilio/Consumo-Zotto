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

  const btnCadastrar = document.getElementById("btnCadastrarFalta");
  const btnPesquisar = document.getElementById("btnPesquisarFaltas");

  if (btnCadastrar) {
    btnCadastrar.addEventListener("click", async (e) => {
      e.preventDefault();
      await cadastrarFalta();
    });
  }

  if (btnPesquisar) {
    btnPesquisar.addEventListener("click", async (e) => {
      e.preventDefault();
      await carregarFaltas();
    });
  }

  async function cadastrarFalta() {
    if (btnCadastrar) btnCadastrar.disabled = true;

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
      if (btnCadastrar) btnCadastrar.disabled = false;
      return;
    }

    // Validar se falta é um número decimal válido
    const faltaNormalizado = normalizarDecimal(falta);
    if (!validarDecimal(faltaNormalizado)) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Falta deve ser um número válido (ex: 10,5 ou 10.5).",
      });
      if (btnCadastrar) btnCadastrar.disabled = false;
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
        conteudo: "Erro ao cadastrar falta!",
      });
    } finally {
      if (btnCadastrar) btnCadastrar.disabled = false;
    }
  }
});

function normalizarDecimal(valor) {
  if (!valor) return valor;
  valor = valor.trim();

  if (!valor.includes(",") && !valor.includes(".")) {
    return valor;
  }

  if (valor.includes(",")) {
    valor = valor.replace(/\./g, "");
    valor = valor.replace(",", ".");
  }
  return valor;
}

function validarDecimal(valor) {
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(valor.toString());
}
