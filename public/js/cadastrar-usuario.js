import { BASE_URL } from "../js/api/config.js";
import { getUserFromToken, logout } from "../js/utils/auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const userInfo = document.getElementById("userInfo");
    const user = getUserFromToken();

    if (user) {
        userInfo.textContent = `${user.nome}`;
    } else {
        userInfo.textContent = "Não autenticado";
    }
 
document.getElementById("logoutBtn").addEventListener("click", logout);

const form = document.getElementById("cadastroUsuarioForm");
    form.addEventListener("submit", async (e) => {
    e.preventDefault();
   
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const role = document.getElementById("role").value; 

  if (!nome || !email || !senha || !role) {
    showModalSistema({
      titulo: 'Atenção',
      conteudo: 'Preencha todos os campos obrigatórios.'
    });
    return;
  }

  if (senha.length < 6) {
    showModalSistema({
      titulo: 'Atenção',
      conteudo: 'A senha deve ter pelo menos 6 dígitos.'
    });   
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/usuarios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ nome, email, senha, role })
    });

    const data = await response.json();
    if (response.ok) {
        showModalSistema({
          titulo: 'Sucesso',
          conteudo: 'Usuário cadastrado com sucesso!',
          onConfirmar: () =>  window.location.href = "consultas.html"
      });
    } else {
        showModalSistema({
          titulo: 'Erro',
          conteudo: data.error || data.message || 'Erro desconhecido.'
        });  
    } 
  } catch (error) {
        alert("Erro inesperado. Tente novamente.");
  }
    });
}); 

function showModalSistema({ titulo = '', conteudo = '', erros = [], showConfirmar = false, onConfirmar = null }) {
  document.getElementById('modalSistema_titulo').textContent = titulo;
  document.getElementById('modalSistema_conteudo').textContent = conteudo;

  const listaErros = document.getElementById('modalSistema_listaErros');
  if (erros.length > 0) {
        listaErros.innerHTML = erros.map(e => `<li>${e}</li>`).join('');
        listaErros.classList.remove('d-none');
    } else {
        listaErros.innerHTML = '';
        listaErros.classList.add('d-none');
    } 

  const btnConfirmar = document.getElementById('modalSistema_btnConfirmar');
    if (showConfirmar) {
        btnConfirmar.classList.remove('d-none');
        btnConfirmar.onclick = () => {
            if (onConfirmar) onConfirmar();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalSistema'));
            modal.hide();
        };
    } else {
        btnConfirmar.classList.add('d-none');
        btnConfirmar.onclick = null;
    } 
    
    const modal = new bootstrap.Modal(document.getElementById('modalSistema'));
    modal.show();
}


