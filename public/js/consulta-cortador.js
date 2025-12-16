import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./services/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";
import { getUserFromToken } from "./services/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userNameDisplay");
  const user = getUserFromToken();
  carregarCortadores();

  if (user) {
    userNameDisplay.textContent = `${user.nome}`;
  } else {
    userNameDisplay.textContent = "Não autenticado";
  }

  document
    .getElementById("filtrosCortadores")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await carregarCortadores();
    });

  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    document.getElementById("nome").value = "";
    document.getElementById("nivel_experiencia").value = "";
    carregarCortadores();
  });
});

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function carregarCortadores() {
  const nome = document.getElementById("nome").value.trim().toLowerCase();
  const nivel_experiencia = document
    .getElementById("nivel_experiencia")
    .value.trim()
    .toLowerCase();

  try {
    const response = await fetchWithAuth(`${BASE_URL}/cortadores`);
    const cortadores = await response.json();

    const filtrados = cortadores.filter((u) => {
      return (
        (!nome ||
          removerAcentos(u.nome.toLowerCase()).includes(
            removerAcentos(nome)
          )) &&
        (!nivel_experiencia ||
          u.nivel_experiencia.toLowerCase() === nivel_experiencia)
      );
    });

    preencherTabela(filtrados);
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: "Erro ao carregar cortadores.",
    });
  }
}

function preencherTabela(cortadores) {
  const tbody = document.getElementById("listaCortadores");
  tbody.innerHTML = "";

  if (cortadores.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='4' class='text-center'>Nenhum cortador encontrado.</td></tr>";
    return;
  }
  cortadores.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.nivel_experiencia}</td>
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
        conteudo: "Deseja excluir este cortador?",
        confirmacao: true,
        callbackConfirmar: async () => {
          try {
            await fetchWithAuth(`${BASE_URL}/cortadores/${id}`, {
              method: "DELETE",
            });
            const modalEl = document.getElementById("modalSistema");
            modalEl.addEventListener("hidden.bs.modal", function handler() {
              carregarCortadores();
              modalEl.removeEventListener("hidden.bs.modal", handler);
            });
          } catch (err) {
            showModalSistema({
              titulo: "Erro",
              conteudo: err?.message || "Erro ao excluir cortador.",
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
        await salvarEdicaoCortador(linha, id);
        return;
      }

      try {
        const response = await fetchWithAuth(`${BASE_URL}/cortadores/${id}`);
        const cortador = await response.json();

        if (!response.ok) {
          throw new Error(cortador.message || "Erro ao buscar cortador.");
        }

        linha.classList.add("editando");

        const tds = linha.querySelectorAll("td");
        const nome = tds[0].textContent.trim();
        const nivel_experiencia = tds[1].textContent.trim();

        tds[0].innerHTML = `<input type="text" class="form-control form-control-sm" value="${nome}" id="editNome-${id}">`;

        tds[1].innerHTML = `
          <select class="form-select form-select-sm" id="editNivel-experiencia-${id}">
            <option value="experiente" ${nivel_experiencia === "experiente" ? "selected" : ""}>Experiente</option>
            <option value="novato" ${nivel_experiencia === "novato" ? "selected" : ""}>Novato</option>
          </select>
        `;

        tds[2].innerHTML = `
          <button class="btn btn-success btn-sm btn-salvar" data-id="${id}">
            <i class="fas fa-check"></i>
          </button>
        `;

        tds[3].innerHTML = `
          <button class="btn btn-secondary btn-sm btn-cancelar" data-id="${id}">
            <i class="fas fa-times"></i>
          </button>
        `;

        linha
          .querySelector(".btn-salvar")
          .addEventListener("click", async () => {
            await salvarEdicaoCortador(linha, id);
          });

        linha.querySelector(".btn-cancelar").addEventListener("click", () => {
          carregarCortadores();
        });
      } catch (err) {
        showModalSistema({
          titulo: "Erro",
          conteudo: err?.message || "Erro ao carregar dados do cortador.",
        });
      }
    });
  });
}

async function salvarEdicaoCortador(linha, id) {
  const nome = document.getElementById(`editNome-${id}`).value.trim();
  const nivel_experiencia = document.getElementById(
    `editNivel-experiencia-${id}`
  ).value;

  if (!nome || !nivel_experiencia) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Preencha todos os campos antes de salvar.",
    });
    return;
  }

  try {
    const response = await fetchWithAuth(`${BASE_URL}/cortadores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, nivel_experiencia }),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.message || "Erro ao atualizar cortador.");
    }

    showModalSistema({
      titulo: "Sucesso",
      conteudo: "Cortador atualizado com sucesso!",
    });

    const modalEl = document.getElementById("modalSistema");
    modalEl.addEventListener("hidden.bs.modal", function handler() {
      carregarCortadores();
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
  const campos = ["nome", "nivel_experiencia"];
  campos.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  carregarCortadores();
}
