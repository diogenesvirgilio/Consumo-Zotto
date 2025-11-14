export function showModalSistema({
  titulo = "",
  conteudo = "",
  erros = [],
  confirmacao = false,
  callbackConfirmar = null,
}) {
  // Pegando elementos só uma vez
  const modalEl = document.getElementById("modalSistema");
  const tituloEl = document.getElementById("modalSistema_titulo");
  const conteudoEl = document.getElementById("modalSistema_conteudo");
  const listaErrosEl = document.getElementById("modalSistema_listaErros");
  const btnConfirmarEl = document.getElementById("modalSistema_btnConfirmar");

  // Atualiza título e texto
  tituloEl.textContent = titulo;
  conteudoEl.textContent = conteudo;

  // Exibir erros (se existirem)
  if (erros.length > 0) {
    listaErrosEl.innerHTML = erros.map((e) => `<li>${e}</li>`).join("");
    listaErrosEl.classList.remove("d-none");
  } else {
    listaErrosEl.innerHTML = "";
    listaErrosEl.classList.add("d-none");
  }

  // Controle do botão de confirmação
  if (confirmacao) {
    btnConfirmarEl.classList.remove("d-none");
    btnConfirmarEl.onclick = async () => {
      if (callbackConfirmar) await callbackConfirmar();
      modalInstance.hide();
    };
  } else {
    btnConfirmarEl.classList.add("d-none");
    btnConfirmarEl.onclick = null;
  }

  // Cria apenas UMA instância do modal
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  modalInstance.show();
}
