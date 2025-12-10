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

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function carregarFaltas() {
  const materiaPrima = document
    .getElementById("materiaPrima")
    .value.trim()
    .toLowerCase();
  const cortador = document
    .getElementById("cortador")
    .value.trim()
    .toLowerCase();
  const falta = document.getElementById("falta").value.trim().toLowerCase();
  const data = document.getElementById("data").value.trim().toLowerCase();
  const programacao = document
    .getElementById("programacao")
    .value.trim()
    .toLowerCase();
  const diaReuniao = document
    .getElementById("diaReuniao")
    .value.trim()
    .toLowerCase();
  const requisicao = document
    .getElementById("requisicao")
    .value.trim()
    .toLowerCase();
  const observacao = document
    .getElementById("observacao")
    .value.trim()
    .toLowerCase();

  try {
    const response = await fetchWithAuth(`${BASE_URL}/faltas`);
    const faltas = await response.json();

    const filtrados = faltas.filter((u) => {
      return (
        (!requisicao ||
          removerAcentos(u.requisicao.toLowerCase()).includes(
            removerAcentos(requisicao)
          )) &&
        (!materiaPrima ||
          u.materia_prima_nome.toLowerCase() === materiaPrima) &&
        (!cortador || u.cortador_nome.toLowerCase() === cortador)
      );
    });

    preencherTabela(filtrados);
  } catch (err) {
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
