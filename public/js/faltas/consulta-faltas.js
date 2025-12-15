import { BASE_URL } from "../api/config.js";
import { showModalSistema } from "../utils/modalService.js";
import { fetchWithAuth } from "../api/authRefresh.js";
import { getUserFromToken } from "../utils/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userNameDisplay");
  const user = getUserFromToken();
  carregarFaltas();

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
    document.getElementById("requisicao").value.trim()
  );

  const programacao = normalize(
    document.getElementById("programacao").value.trim()
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
}

export async function limparFiltros() {
  const campos = ["materiaPrima", "cortador"];
  campos.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  carregarFaltas();
}
