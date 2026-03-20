import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./services/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";
import { requireAuth } from "./services/auth-guard.js";

document.addEventListener("DOMContentLoaded", () => {
  // verfica se o usuário tem permissão de admin
  if (!requireAuth(["admin"])) {
    return;
  }

  // Função para validar entrada de números com vírgula
  const validateDecimalInput = (e) => {
    const value = e.target.value;
    // Remove qualquer caractere que não seja número ou vírgula
    e.target.value = value.replace(/[^0-9,]/g, '');
    // Impede múltiplas vírgulas
    if ((e.target.value.match(/,/g) || []).length > 1) {
      e.target.value = e.target.value.replace(/,(?=.*,)/, '');
    }
  };

  // Aplicar validação em todos os inputs de peso
  const weightInputs = document.querySelectorAll('input[inputmode="decimal"]');
  weightInputs.forEach(input => {
    input.addEventListener('input', validateDecimalInput);
  });

  // Adicionar event listeners para cálculo dos pesos nas trocas de PAR e SOLETA
  for (let numero = 37; numero <= 44; numero++) {
    const solaInput = document.getElementById(`sola_${numero}`);
    const soletaInput = document.getElementById(`soleta_${numero}`);

    if (!solaInput || !soletaInput) continue;

    function calcular() {
      const sola = parseFloat(solaInput.value.replace(',', '.')) || 0;
      const soleta = parseFloat(soletaInput.value.replace(',', '.')) || 0;

      const cunho = sola - soleta;

      const cunhoInput = document.getElementById(`cunho_${numero}`);
      const pigSoletaInput = document.getElementById(`pig_soleta_${numero}`);
      const pigCunhoInput = document.getElementById(`pig_cunho_${numero}`);

      if (cunhoInput) {
        cunhoInput.value = cunho.toFixed(5);
      }

      // ajustar de acordo com o material
      const fatorPig = 2;

      if (pigSoletaInput) {
        pigSoletaInput.value = (soleta * fatorPig).toFixed(5);
      }

      if (pigCunhoInput) {
        pigCunhoInput.value = (cunho * fatorPig).toFixed(5);
      }
    }

    solaInput.addEventListener("input", calcular);
    soletaInput.addEventListener("input", calcular);
  }

  const form = document.getElementById("cadastroSolaForm");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (submitBtn) submitBtn.disabled = true;

    const nome_sola = document.getElementById("nome_sola").value.trim();
    const codigo_sola = document.getElementById("codigo_sola").value.trim();
    const data_atualizacao = document.getElementById("data_atualizacao").value;

    if (!nome_sola || !codigo_sola || !data_atualizacao) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Preencha todos os campos obrigatórios.",
      });
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const pesos = [];

    // montar lista de pesos

    for (let numero = 37; numero <= 44; numero++) {
      const peso_sola = document.getElementById(`sola_${numero}`)?.value;
      const peso_soleta = document.getElementById(`soleta_${numero}`)?.value;

      // só adiciona se tiver pelo menos um valor
      if (peso_sola || peso_soleta) {
        pesos.push({
          numero,
          peso_sola: peso_sola ? parseFloat(peso_sola.replace(',', '.')) : null,
          peso_soleta: peso_soleta ? parseFloat(peso_soleta.replace(',', '.')) : null,
        });
      }
    }

    if (pesos.length === 0) {
      showModalSistema({
        titulo: "Atenção",
        conteudo: "Informe pelo menos um peso.",
      });
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    try {
      const response = await fetchWithAuth(`${BASE_URL}/solas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_sola,
          codigo_sola,
          data_atualizacao,
          pesos,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        form.reset();

        showModalSistema({
          titulo: "Sucesso",
          conteudo: "Sola cadastrada com sucesso!",
          onConfirmar: () => (window.location.href = "pesos-sola.html"),
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
        conteudo: "Erro ao cadastrar sola.",
      });
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
