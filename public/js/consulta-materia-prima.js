import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./services/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";
import { getUserFromToken } from "./services/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userNameDisplay");
  const user = getUserFromToken();
  carregarMateriasPrima();

  if (user) {
    userNameDisplay.textContent = `${user.nome}`;
  } else {
    userNameDisplay.textContent = "Não autenticado";
  }

  document
    .getElementById("filtrosMateriaPrima")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await carregarMateriasPrima();
    });

  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    document.getElementById("nome").value = "";
    carregarMateriasPrima();
  });
});

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function carregarMateriasPrima() {
  const nome = document.getElementById("nome").value.trim().toLowerCase();

  try {
    const response = await fetchWithAuth(`${BASE_URL}/materiaPrima`);
    const materiasPrima = await response.json();

    const filtrados = materiasPrima.filter((u) => {
      return (
        !nome ||
        removerAcentos(u.nome.toLowerCase()).includes(removerAcentos(nome))
      );
    });
    preencherTabela(filtrados);
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: "Erro ao carregar as matérias primas.",
    });
  }
}

function preencherTabela(materiasPrima) {
  const tbody = document.getElementById("listaMateriasPrima");
  tbody.innerHTML = "";

  if (materiasPrima.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='4' class='text-center'>Nenhuma matéria prima encontrada.</td></tr>";
    return;
  }

  materiasPrima.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td>${u.nome}</td>
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
        conteudo: "Deseja excluir esta matéria prima?",
        confirmacao: true,
        callbackConfirmar: async () => {
          try {
            await fetchWithAuth(`${BASE_URL}/materiaPrima/${id}`, {
              method: "DELETE",
            });
            const modalEl = document.getElementById("modalSistema");
            modalEl.addEventListener("hidden.bs.modal", function handler() {
              carregarMateriasPrima();
              modalEl.removeEventListener("hidden.bs.modal", handler);
            });
          } catch (err) {
            showModalSistema({
              titulo: "Erro",
              conteudo: err?.message || "Erro ao excluir matéria prima.",
            });
          }
        },
      });
    });
  });
}

async function salvarEdicaoMateriaPrima(linha, id) {
  const nome = document.getElementById(`editNome-${id}`).value.trim();

  if (!nome) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Preencha todos os campos antes de salvar.",
    });
    return;
  }

  try {
    const response = await fetchWithAuth(`${BASE_URL}/materiaPrima/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.message || "Erro ao atualizar matéria prima.");
    }

    showModalSistema({
      titulo: "Sucesso",
      conteudo: "Matéria prima atualizado com sucesso!",
    });

    const modalEl = document.getElementById("modalSistema");
    modalEl.addEventListener("hidden.bs.modal", function handler() {
      carregarMateriasPrima();
      modalEl.removeEventListener("hidden.bs.modal", handler);
    });
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: err?.message || "Erro ao salvar alterações.",
    });
  }
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
        await salvarEdicaoMateriaPrima(linha, id);
        return;
      }

      try {
        const response = await fetchWithAuth(`${BASE_URL}/materiaPrima/${id}`);
        const cortador = await response.json();

        if (!response.ok) {
          throw new Error(cortador.message || "Erro ao buscar matéria prima.");
        }

        linha.classList.add("editando");

        const tds = linha.querySelectorAll("td");
        const nome = tds[0].textContent.trim();

        tds[0].innerHTML = `<input type="text" class="form-control form-control-sm" value="${nome}" id="editNome-${id}">`;

        tds[1].innerHTML = `
          <button class="btn btn-success btn-sm btn-salvar" data-id="${id}">
            <i class="fas fa-check"></i>
          </button>
        `;

        tds[2].innerHTML = `
          <button class="btn btn-secondary btn-sm btn-cancelar" data-id="${id}">
            <i class="fas fa-times"></i>
          </button>
        `;

        linha
          .querySelector(".btn-salvar")
          .addEventListener("click", async () => {
            await salvarEdicaoMateriaPrima(linha, id);
          });

        linha.querySelector(".btn-cancelar").addEventListener("click", () => {
          carregarMateriasPrima();
        });
      } catch (err) {
        showModalSistema({
          titulo: "Erro",
          conteudo: err?.message || "Erro ao carregar os dados.",
        });
      }
    });
  });
}

export async function limparFiltros() {
  const campos = ["nome"];
  campos.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  carregarMateriasPrima();
}
