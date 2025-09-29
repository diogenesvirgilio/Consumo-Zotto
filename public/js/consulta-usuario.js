import { BASE_URL } from "../js/api/config.js";
import { showModalSistema } from "./utils/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";

document.addEventListener("DOMContentLoaded", () => {
  carregarUsuarios();

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
    `;
    tbody.appendChild(tr);
  });
}

export async function limparFiltros() {
  const campos = ["nome", "cpf", "data_vencimento"];
  campos.forEach((id) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = "";
  });

  carregarUsuarios();
}
