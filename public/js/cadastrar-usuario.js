import { BASE_URL } from "../js/api/config.js";
import { getUserFromToken, logout } from "../js/utils/auth.js";
import { showModalSistema } from "./utils/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";

document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("userInfo");
  const user = getUserFromToken();

  if (user) {
    userInfo.textContent = `${user.nome}`;
  } else {
    userInfo.textContent = "Não autenticado";
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);

  const form = document.getElementById("cadastroUsuarioForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const role = document.getElementById("role").value;

    if (!nome || !email || !senha || !role) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    if (senha.length < 6) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "A senha deve ter pelo menos 6 dígitos.",
      });
      return;
    }

    if (role === "") {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Selecione uma categoria válida.",
      });
      return;
    }

    try {
      const response = await fetchWithAuth(`${BASE_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, senha, role }),
      });

      const data = await response.json();
      if (response.ok) {
        form.reset();
        showModalSistema({
          titulo: "Sucesso",
          conteudo: "Usuário cadastrado com sucesso!",
          onConfirmar: () => (window.location.href = "consultas.html"),
        });
      } else {
        showModalSistema({
          titulo: "Erro",
          conteudo: data.error || data.message || "Erro desconhecido.",
        });
      }
    } catch (error) {
      showModalSistema({
        titulo: "Erro",
        conteudo: "Usuário ou senha inválidos.",
      });
    }
  });
});
