import { getUserFromToken, logout } from "./utils/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = getUserFromToken();

  const userNameDisplay = document.getElementById("userNameDisplay");

  if (user) {
    userNameDisplay.textContent = `${user.nome}`;
  } else {
    userNameDisplay.textContent = "Não autenticado";
    window.location.href = "login.html";
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  if (usuarioLogado?.role !== "admin") {
    const linksBloqueados = [
      "cadastrar-usuario.html",
      "consultas-usuario.html",
      "cadastrar-cortador.html",
      "consultas-cortador.html",
    ];

    document.querySelectorAll(".dropdown-item").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && linksBloqueados.some((bloq) => href.includes(bloq))) {
        link.classList.add("disabled-link");
      }
    });
  }
});

const user = getUserFromToken();

if (user && user.role !== "admin") {
  document
    .querySelectorAll(
      'a[href*="cadastrar-usuario"], a[href*="cadastrar-cortador"]'
    )
    .forEach((link) => {
      link.classList.add("disabled-link");
      link.addEventListener("click", (e) => e.preventDefault());
    });
}
