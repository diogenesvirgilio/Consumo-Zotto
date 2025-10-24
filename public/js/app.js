import { getUserFromToken, logout } from "./utils/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = getUserFromToken();

  const userNameDisplay = document.getElementById("userNameDisplay");

  if (usuarioLogado) {
    userNameDisplay.textContent = `${usuarioLogado.nome}`;
  } else {
    userNameDisplay.textContent = "Não autenticado";
    window.location.href = "login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Aplica as restrições de acesso para usuários não-admin
  if (usuarioLogado?.role !== "admin") {
    const linksBloqueados = [
      "cadastrar-usuario.html",
      "cadastrar-cortador.html",
    ];

    // Desabilita os links de cadastro para usuários não-admin
    document.querySelectorAll(".dropdown-item").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && linksBloqueados.some((bloq) => href.includes(bloq))) {
        link.classList.add("disabled-link");
        link.addEventListener("click", (e) => e.preventDefault());
      }
    });
  }
});
