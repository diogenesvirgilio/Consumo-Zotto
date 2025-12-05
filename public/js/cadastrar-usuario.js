import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./utils/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";
import { requireAuth } from "./utils/auth-guard.js";

document.addEventListener("DOMContentLoaded", () => {
  // verfica se o usuário tem permissão de admin
  if (!requireAuth(["admin"])) {
    return;
  }

  const form = document.getElementById("cadastroUsuarioForm");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form) return;

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (submitBtn) submitBtn.disabled = true;

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const role = document.getElementById("role").value;

    if (!nome || !email || !senha || !role) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Preencha todos os campos obrigatórios.",
      });
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (!isValidEmail(email)) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Por favor, insira um e-mail válido.",
      });
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (senha.length < 6) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "A senha deve ter pelo menos 6 dígitos.",
      });
      if (submitBtn) submitBtn.disabled = false;
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
    } catch (err) {
      showModalSistema({
        titulo: "Erro",
        conteudo: "Usuário ou senha inválidos.",
      });
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
