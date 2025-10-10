import { getUserFromToken } from "./utils/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = getUserFromToken();

  if (usuarioLogado?.role !== "admin") {
    const linksBloqueados = [
      "cadastro-usuario.html",
      "consultas-usuario.html",
      "cadastro-cortador.html",
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
