import { BASE_URL } from "../api/config.js";
import { showModalSistema } from "../services/modalService.js";
import { fetchWithAuth } from "../api/authRefresh.js";
import { getUserFromToken } from "../services/auth.js";
import {
  carregarMateriasPrima,
  carregarCortadores,
} from "./cadastrar-faltas.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userNameDisplay");
  const user = getUserFromToken();
  carregarFaltas();

  carregarMateriasPrima(document.getElementById("materiaPrima"));
  carregarCortadores(document.getElementById("cortador"));

  if (user) {
    userNameDisplay.textContent = `${user.nome}`;
  } else {
    userNameDisplay.textContent = "Não autenticado";
  }

  document
    .getElementById("cadastroFaltasForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await carregarFaltas();
    });

  document.getElementById("btnLimparFalta").addEventListener("click", () => {
    document.getElementById("materiaPrima").value = "";
    document.getElementById("cortador").value = "";
    document.getElementById("falta").value = "";
    document.getElementById("data").value = "";
    document.getElementById("programacao").value = "";
    document.getElementById("diaReuniao").value = "";
    document.getElementById("requisicao").value = "";
    document.getElementById("observacao").value = "";
    carregarFaltas();
  });
});

function removerAcentos(str = "") {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const normalize = (v) => (v || "").toString().toLowerCase();

function normalizarData(d) {
  if (!d) return "";
  // força formato yyyy-mm-dd como o input type="date"
  return new Date(d).toISOString().split("T")[0];
}

export async function carregarFaltas() {
  let materiaPrima = document.getElementById("materiaPrima").value.trim();
  let cortador = document.getElementById("cortador").value.trim();

  const requisicao = normalize(
    document.getElementById("requisicao").value.trim(),
  );

  const programacao = normalize(
    document.getElementById("programacao").value.trim(),
  );

  const data = normalize(document.getElementById("data").value.trim());

  // normalizar select
  if (/^selecione/i.test(materiaPrima)) materiaPrima = "";
  if (/^selecione/i.test(cortador)) cortador = "";

  const materiaPrimaRaw = materiaPrima;
  const materiaPrimaSearch = removerAcentos(materiaPrima).toLowerCase();
  const materiaPrimaIsId = /^\d+$/.test(materiaPrimaRaw);

  const cortadorRaw = cortador;
  const cortadorSearch = removerAcentos(cortador).toLowerCase();
  const cortadorIsId = /^\d+$/.test(cortadorRaw);

  try {
    const response = await fetchWithAuth(`${BASE_URL}/faltas`);
    const faltas = await response.json();

    const filtrados = faltas.filter((u) => {
      // pré-processar uma única vez
      const uRequisicao = normalize(u.requisicao);
      const uProgramacao = normalize(u.programacao);
      const uData = normalize(normalizarData(u.data));

      const uMateriaId = (u.materia_prima_id || "").toString();
      const uMateriaNome = (u.materia_prima_nome || "").toString();
      const uMateriaNomeSearch = removerAcentos(uMateriaNome).toLowerCase();

      const uCortadorId = (u.cortador_id || "").toString();
      const uCortadorNome = (u.cortador_nome || "").toString();
      const uCortadorNomeSearch = removerAcentos(uCortadorNome).toLowerCase();

      // filtros
      const matchRequisicao = !requisicao || uRequisicao.includes(requisicao);
      const matchProgramacao =
        !programacao || uProgramacao.startsWith(programacao);
      const matchData = !data || uData.includes(data);

      let matchMateria = true;
      if (materiaPrimaRaw) {
        matchMateria = materiaPrimaIsId
          ? uMateriaId === materiaPrimaRaw
          : uMateriaNomeSearch.includes(materiaPrimaSearch);
      }

      let matchCortador = true;
      if (cortadorRaw) {
        matchCortador = cortadorIsId
          ? uCortadorId === cortadorRaw
          : uCortadorNomeSearch.includes(cortadorSearch);
      }

      return (
        matchRequisicao &&
        matchProgramacao &&
        matchData &&
        matchMateria &&
        matchCortador
      );
    });

    preencherTabela(filtrados);
  } catch (err) {
    console.error("Erro ao carregar faltas:", err);
    showModalSistema({
      titulo: "Erro",
      conteudo: "Erro ao carregar faltas.",
    });
  }
}

function preencherTabela(faltas) {
  const tbody = document.getElementById("listaFaltas");
  tbody.innerHTML = "";

  if (faltas.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='4' class='text-center'>Nenhuma falta encontrada.</td></tr>";
    return;
  }

  faltas.forEach((u) => {
    const tr = document.createElement("tr");

    tr.dataset.materiaId = u.materia_prima_id;
    tr.dataset.cortadorId = u.cortador_id;

    tr.innerHTML = `
        <td>${u.materia_prima_nome || "N/A"}</td>
        <td>${u.cortador_nome || "N/A"}</td>
        <td>${u.falta}</td>
        <td>${u.data ? new Date(u.data).toLocaleDateString() : ""}</td>
        <td>${u.programacao || "N/A"}</td>
        <td>${u.requisicao || "N/A"}</td>
        <td>${u.obs || "N/A"}</td>
        <td>
          <button class="btn btn-warning btn-sm btn-editar" data-id="${u.id}">
            <i class="fas fa-edit"></i>
          </button>
        </td>

        <td>
          <button class="btn btn-danger btn-sm btn-excluir" data-id="${u.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  //Remove o botão editar excluir da tabela para usuários que não são admin.
  const usuarioLogado = getUserFromToken();
  if (usuarioLogado?.role !== "admin") {
    ["btn-editar", "btn-excluir"].forEach((classe) => {
      document.querySelectorAll(`.${classe}`).forEach((btn) => {
        btn.classList.add("d-none");
      });
    });
  }

  adicionarEventosExcluir();
  adicionarEventosEditar();
}

function adicionarEventosExcluir() {
  const botoesExcluir = document.querySelectorAll(".btn-excluir");
  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", async (e) => {
      const id = e.target.closest("button").getAttribute("data-id");
      showModalSistema({
        titulo: "Confirmação",
        conteudo: "Deseja excluir esta falta?",
        confirmacao: true,
        callbackConfirmar: async () => {
          try {
            await fetchWithAuth(`${BASE_URL}/faltas/${id}`, {
              method: "DELETE",
            });
            const modalEl = document.getElementById("modalSistema");
            modalEl.addEventListener("hidden.bs.modal", function handler() {
              carregarFaltas();
              modalEl.removeEventListener("hidden.bs.modal", handler);
            });
          } catch (err) {
            showModalSistema({
              titulo: "Erro",
              conteudo: err?.message || "Erro ao excluir falta.",
            });
          }
        },
      });
    });
  });
}

function adicionarEventosEditar() {
  const botoesEditar = document.querySelectorAll(".btn-editar");

  botoesEditar.forEach((botao) => {
    botao.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      const id = btn.getAttribute("data-id");
      const linha = btn.closest("tr");

      const jaEditando = document.querySelector("tr.editando");
      if (jaEditando && jaEditando !== linha) {
        showModalSistema({
          titulo: "Aviso",
          conteudo: "Finalize a edição.",
        });
        return;
      }

      if (linha.classList.contains("editando")) {
        await salvarEdicaoFalta(linha, id);
        return;
      }

      try {
        linha.classList.add("editando");

        const materiaPrimaIdAtual = linha.dataset.materiaId;
        const cortadorIdAtual = linha.dataset.cortadorId;

        const tds = linha.querySelectorAll("td");
        const faltaQtd = tds[2].textContent.trim();
        const data = tds[3].textContent.trim();
        const programacao = tds[4].textContent.trim();
        const requisicao = tds[5].textContent.trim();
        const observacao = tds[6].textContent.trim();

        tds[0].innerHTML = `
          <select class="form-select form-select-sm" id="editMateriaPrima-${id}">
          </select>
        `;

        tds[1].innerHTML = `
          <select class="form-select form-select-sm" id="editCortador-${id}">
          </select>
        `;

        tds[2].innerHTML = `<input type="text" class="form-control form-control-sm" value="${faltaQtd}" id="editFaltaQtd-${id}">`;

        tds[3].innerHTML = `<input type="data" class="form-control form-control-sm" value="${data}" id="editData-${id}">`;

        tds[4].innerHTML = `<input type="text" class="form-control form-control-sm" value="${programacao}" id="editProgramacao-${id}">`;

        tds[5].innerHTML = `<input type="text" class="form-control form-control-sm" value="${requisicao}" id="editRequisicao-${id}">`;

        tds[6].innerHTML = `<input type="text" class="form-control form-control-sm" value="${observacao}" id="editObservacao-${id}">`;

        tds[7].innerHTML = `
          <button class="btn btn-success btn-sm btn-salvar" data-id="${id}">
            <i class="fas fa-check"></i>
          </button>
        `;

        tds[8].innerHTML = `
          <button class="btn btn-secondary btn-sm btn-cancelar" data-id="${id}">
            <i class="fas fa-times"></i>
          </button>
        `;
        await carregarMateriasPrima(
          document.getElementById(`editMateriaPrima-${id}`),
          materiaPrimaIdAtual,
        );

        await carregarCortadores(
          document.getElementById(`editCortador-${id}`),
          cortadorIdAtual,
        );

        linha
          .querySelector(".btn-salvar")
          .addEventListener("click", async () => {
            await salvarEdicaoFalta(linha, id);
          });

        linha.querySelector(".btn-cancelar").addEventListener("click", () => {
          carregarFaltas();
        });
      } catch (err) {
        showModalSistema({
          titulo: "Erro",
          conteudo: err?.message || "Erro ao carregar dados.",
        });
      }
    });
  });
}

async function salvarEdicaoFalta(linha, id) {
  const materiaPrima = document
    .getElementById(`editMateriaPrima-${id}`)
    ?.value.trim();
  const cortador = document.getElementById(`editCortador-${id}`)?.value.trim();
  const faltaQtd = document.getElementById(`editFaltaQtd-${id}`)?.value;
  const data = document.getElementById(`editData-${id}`)?.value;
  const programacao = document.getElementById(`editProgramacao-${id}`)?.value;
  const requisicao = document.getElementById(`editRequisicao-${id}`)?.value;
  const observacao = document.getElementById(`editObservacao-${id}`)?.value;

  if (
    !materiaPrima ||
    !cortador ||
    !faltaQtd ||
    !data ||
    !programacao ||
    !requisicao ||
    !observacao
  ) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Preencha todos os campos antes de salvar.",
    });
    return;
  }

  try {
    const response = await fetchWithAuth(`${BASE_URL}/faltas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        materiaPrimaId: Number(materiaPrima),
        cortadorId: cortador ? Number(cortador) : null,
        falta: Number(faltaQtd),
        data,
        programacao,
        requisicao,
        obs: observacao,
      }),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.message || "Erro ao atualizar falta.");
    }

    showModalSistema({
      titulo: "Sucesso",
      conteudo: "Falta atualizado com sucesso!",
    });

    const modalEl = document.getElementById("modalSistema");
    modalEl.addEventListener("hidden.bs.modal", function handler() {
      carregarFaltas();
      modalEl.removeEventListener("hidden.bs.modal", handler);
    });
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: err?.message || "Erro ao salvar alterações.",
    });
  }
}

export async function limparFiltros() {
  const campos = ["materiaPrima", "cortador"];
  campos.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  carregarFaltas();
}
