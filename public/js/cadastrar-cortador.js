import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./utils/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroCortadorForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const roleExp = document.getElementById("roleExp").value;

    if (!nome || !roleExp) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    if (roleExp === "") {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Selecione um nível válido.",
      });
      return;
    }

    try {
      const response = await fetchWithAuth(`${BASE_URL}/cortadores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, roleExp }),
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
          conteudo: data.error || data.message || "Erro desconhecido.",
        });
      }
    } catch (err) {
      showModalSistema({
        titulo: "Erro",
        conteudo: "Erro ao cadastrar.",
      });
    }
  });
});
