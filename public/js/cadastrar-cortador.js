import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./utils/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroCortadorForm");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (submitBtn) submitBtn.disabled = true;

    const nome = document.getElementById("nome").value.trim();
    const roleExp = document.getElementById("roleExp").value;

    if (!nome || !roleExp) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Preencha todos os campos obrigatórios.",
      });
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    try {
      const response = await fetchWithAuth(`${BASE_URL}/cortadores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, nivel_experiencia: roleExp }),
      });

      const data = await response.json();
      if (response.ok) {
        form.reset();
        showModalSistema({
          titulo: "Sucesso",
          conteudo: "Cortador cadastrado com sucesso!",
        });
      } else {
        showModalSistema({
          titulo: "Erro",
          conteudo:
            data.error || data.message || "Erro desconhecido ao cadastrar.",
        });
      }
    } catch (err) {
      showModalSistema({
        titulo: "Erro",
        conteudo: "Não foi possível conectar ao servidor.",
      });
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
