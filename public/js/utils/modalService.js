export function showModalSistema({
  titulo = "",
  conteudo = "",
  erros = [],
  confirmacao = false,
  callbackConfirmar = null,
}) {
  document.getElementById("modalSistema_titulo").textContent = titulo;
  document.getElementById("modalSistema_conteudo").textContent = conteudo;

  const listaErros = document.getElementById("modalSistema_listaErros");
  if (erros.length > 0) {
    listaErros.innerHTML = erros.map((e) => `<li>${e}</li>`).join("");
    listaErros.classList.remove("d-none");
  } else {
    listaErros.innerHTML = "";
    listaErros.classList.remove("d-none");
  }

  const btnConfirmar = document.getElementById("modalSistema_btnConfirmar");
  if (confirmacao) {
    // Remove os eventos antigos
    btnConfirmar.classList.remove("d-none");
    btnConfirmar.onclick = async () => {
      if (callbackConfirmar) await callbackConfirmar();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("modalSistema")
      );
      if (modal) modal.hide();
    };
  } else {
    btnConfirmar.classList.add("d-none");
    btnConfirmar.onclick = null;
  }

  const modal = new bootstrap.Modal(document.getElementById("modalSistema"));
  modal.show();
}
