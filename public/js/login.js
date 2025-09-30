import { setAccessToken, setRefreshToken } from "./utils/storage.js";
import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./utils/modalService.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        showModalSistema({
          titulo: "Atenção",
          conteudo: "Erro no login",
        });
        return;
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      window.location.href = "/pages/index.html";
    } catch (err) {
      showModalSistema({
        titulo: "Erro",
        conteudo: "Usuário ou senha inválidos.",
      });
    }
  });
});
