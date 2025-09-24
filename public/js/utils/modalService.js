export function showModalSistema({ titulo = '', conteudo = '', erros = [] }) {
    document.getElementById('modalSistema_titulo').textContent = titulo; 
    document.getElementById('modalSistema_conteudo').textContent = conteudo;

    const listaErros = document.getElementById('modalSistema_listaErros');
    if (erros.length > 0) {
        listaErros.innerHTML = erros.map(e => `<li>${e}</li>`).join('');
        listaErros.classList.remove('d-none');
    } else {
        listaErros.innerHTML = '';
        listaErros.classList.remove('d-none');
    } 

    document.getElementById('modalSistema_btnConfirmar').classList.add('d-none');

    const modal = new bootstrap.Modal(document.getElementById('modalSistema'));
    modal.show();
}