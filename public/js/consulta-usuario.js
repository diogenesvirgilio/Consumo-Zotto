import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./services/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";
import { getUserFromToken, logout } from "./services/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userNameDisplay");
  const user = getUserFromToken();
  carregarUsuarios();

  if (user) {
    userNameDisplay.textContent = `${user.nome}`;
  } else {
    userNameDisplay.textContent = "Não autenticado";
  }

  document
    .getElementById("filtrosUsuarios")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await carregarUsuarios();
    });

  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    document.getElementById("role").value = "";
    carregarUsuarios();
  });
});

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function carregarUsuarios() {
  const nome = document.getElementById("nome").value.trim().toLowerCase();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const role = document.getElementById("role").value.trim().toLowerCase();

  try {
    const response = await fetchWithAuth(`${BASE_URL}/usuarios`);
    const usuarios = await response.json();

    const filtrados = usuarios.filter((u) => {
      return (
        (!nome ||
          removerAcentos(u.nome.toLowerCase()).includes(
            removerAcentos(nome)
          )) &&
        (!email || u.email.toLowerCase().includes(email)) &&
        (!role || u.role.toLowerCase() === role)
      );
    });

    preencherTabela(filtrados);
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: "Erro ao carregar usuários.",
    });
  }
}

function preencherTabela(usuarios) {
  const tbody = document.getElementById("listaUsuarios");
  tbody.innerHTML = "";

  if (usuarios.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='4' class='text-center'>Nenhum usuário encontrado.</td></tr>";
    return;
  }

  usuarios.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.criado_em ? new Date(u.criado_em).toLocaleDateString() : ""}</td>
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
        conteudo: "Deseja excluir este usuário?",
        confirmacao: true,
        callbackConfirmar: async () => {
          try {
            await fetchWithAuth(`${BASE_URL}/usuarios/${id}`, {
              method: "DELETE",
            });
            const modalEl = document.getElementById("modalSistema");
            modalEl.addEventListener("hidden.bs.modal", function handler() {
              carregarUsuarios();
              modalEl.removeEventListener("hidden.bs.modal", handler);
            });
          } catch (err) {
            showModalSistema({
              titulo: "Erro",
              conteudo: err?.message || "Erro ao excluir usuário.",
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
        await salvarEdicaoUsuario(linha, id);
        return;
      }

      try {
        const response = await fetchWithAuth(`${BASE_URL}/usuarios/${id}`);
        const usuario = await response.json();

        if (!response.ok) {
          throw new Error(usuario.message || "Erro ao buscar usuário.");
        }

        linha.classList.add("editando");

        const tds = linha.querySelectorAll("td");
        const nome = tds[0].textContent.trim();
        const email = tds[1].textContent.trim();
        const role = tds[2].textContent.trim();

        tds[0].innerHTML = `<input type="text" class="form-control form-control-sm" value="${nome}" id="editNome-${id}">`;

        tds[1].innerHTML = `<input type="email" class="form-control form-control-sm" value="${email}" id="editEmail-${id}">`;

        tds[2].innerHTML = `
          <select class="form-select form-select-sm" id="editRole-${id}">
            <option value="user" ${role === "user" ? "selected" : ""}>User</option>
            <option value="admin" ${role === "admin" ? "selected" : ""}>Admin</option>
          </select>
        `;

        tds[4].innerHTML = `
          <button class="btn btn-success btn-sm btn-salvar" data-id="${id}">
            <i class="fas fa-check"></i>
          </button>
        `;

        tds[5].innerHTML = `
          <button class="btn btn-secondary btn-sm btn-cancelar" data-id="${id}">
            <i class="fas fa-times"></i>
          </button>
        `;

        linha
          .querySelector(".btn-salvar")
          .addEventListener("click", async () => {
            await salvarEdicaoUsuario(linha, id);
          });

        linha.querySelector(".btn-cancelar").addEventListener("click", () => {
          carregarUsuarios();
        });
      } catch (err) {
        showModalSistema({
          titulo: "Erro",
          conteudo: err?.message || "Erro ao carregar dados do usuário.",
        });
      }
    });
  });
}

async function salvarEdicaoUsuario(linha, id) {
  const nome = document.getElementById(`editNome-${id}`).value.trim();
  const email = document.getElementById(`editEmail-${id}`).value.trim();
  const role = document.getElementById(`editRole-${id}`).value;

  if (!nome || !email || !role) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Preencha todos os campos antes de salvar.",
    });
    return;
  }

  try {
    const response = await fetchWithAuth(`${BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, role }),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.message || "Erro ao atualizar usuário.");
    }

    showModalSistema({
      titulo: "Sucesso",
      conteudo: "Usuário atualizado com sucesso!",
    });

    const modalEl = document.getElementById("modalSistema");
    modalEl.addEventListener("hidden.bs.modal", function handler() {
      carregarUsuarios();
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
  const campos = ["nome", "cpf", "data_vencimento"];
  campos.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  carregarUsuarios();
}
