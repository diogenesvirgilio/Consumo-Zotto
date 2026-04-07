import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./services/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";
import { requireAuth } from "./services/auth-guard.js";

document.addEventListener("DOMContentLoaded", () => {
  // verfica se o usuário tem permissão de admin
  if (!requireAuth(["admin"])) {
    return;
  }

  let solaEmEdicao = null;

  const formatarPeso = (valor) => {
    if (!valor && valor !== 0) return "";
    let num =
      typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;
    if (isNaN(num)) return "";
    return num.toFixed(5).replace(".", ",");
  };

  const marcarCampoZerado = (input) => {
    if (!input) return;
    const valor = input.value.trim();
    if (!valor || valor === "0" || parseFloat(valor.replace(",", ".")) === 0) {
      input.classList.add("campo-zerado");
    } else {
      input.classList.remove("campo-zerado");
    }
  };

  // Função para validar entrada de números com vírgula
  const validateDecimalInput = (e) => {
    const value = e.target.value;
    // Remove qualquer caractere que não seja número ou vírgula
    e.target.value = value.replace(/[^0-9,]/g, "");
    // Impede múltiplas vírgulas
    if ((e.target.value.match(/,/g) || []).length > 1) {
      e.target.value = e.target.value.replace(/,(?=.*,)/, "");
    }
  };

  // Aplicar validação em todos os inputs de peso
  const weightInputs = document.querySelectorAll('input[inputmode="decimal"]');
  weightInputs.forEach((input) => {
    input.addEventListener("input", validateDecimalInput);
  });

  // Adicionar event listeners para cálculo dos pesos nas trocas de PAR e SOLETA
  const setupCalculos = () => {
    for (let numero = 37; numero <= 44; numero++) {
      const solaInput = document.getElementById(`sola_${numero}`);
      const soletaInput = document.getElementById(`soleta_${numero}`);

      if (!solaInput || !soletaInput) continue;

      function calcular() {
        const sola = parseFloat(solaInput.value.replace(",", ".")) || 0;
        const soleta = parseFloat(soletaInput.value.replace(",", ".")) || 0;

        const cunho = sola - soleta;

        const cunhoInput = document.getElementById(`cunho_${numero}`);
        const pigSoletaInput = document.getElementById(`pig_soleta_${numero}`);
        const pigCunhoInput = document.getElementById(`pig_cunho_${numero}`);

        if (cunhoInput) {
          cunhoInput.value = formatarPeso(cunho);
          marcarCampoZerado(cunhoInput);
        }

        // calcular pigmentos: peso / 100 * 2
        if (pigSoletaInput) {
          const pigSoleta = (soleta / 100) * 2;
          pigSoletaInput.value = formatarPeso(pigSoleta);
          marcarCampoZerado(pigSoletaInput);
        }

        if (pigCunhoInput) {
          const pigCunho = (cunho / 100) * 2;
          pigCunhoInput.value = formatarPeso(pigCunho);
          marcarCampoZerado(pigCunhoInput);
        }
      }

      // Adicionar listener para input
      solaInput.addEventListener("input", calcular);
      soletaInput.addEventListener("input", calcular);
    }
  };

  setupCalculos();

  const form = document.getElementById("cadastroSolaForm");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const resetBtn = form ? form.querySelector('button[type="reset"]') : null;
  const cancelBtn = document.getElementById("btnCancelarEdicao");
  const nomeSolaInput = document.getElementById("nome_sola");
  const codigoSolaInput = document.getElementById("codigo_sola");
  const solasList = document.getElementById("solasList");
  const codigoSolaList = document.getElementById("codigoSolaList");

  if (!form) return;

  // Função para carregar todas as solas e popular os datalists
  const carregarSolas = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/solas`);

      if (!response.ok) {
        throw new Error("Erro ao carregar solas");
      }

      const solas = await response.json();

      // Limpar datalists
      solasList.innerHTML = "";
      codigoSolaList.innerHTML = "";

      // Popular datalists
      solas.forEach((sola) => {
        // Datalist para nome_sola
        const optionNome = document.createElement("option");
        optionNome.value = sola.nome_sola;
        optionNome.textContent = `${sola.nome_sola} (${sola.codigo_sola})`;
        solasList.appendChild(optionNome);

        // Datalist para codigo_sola
        const optionCodigo = document.createElement("option");
        optionCodigo.value = sola.codigo_sola;
        optionCodigo.textContent = `${sola.codigo_sola} - ${sola.nome_sola}`;
        codigoSolaList.appendChild(optionCodigo);
      });
    } catch (err) {
      console.error("Erro ao carregar solas:", err);
    }
  };

  // Carregar solas ao inicializar
  carregarSolas();

  // Função para limpar a edição
  const limparEdicao = () => {
    solaEmEdicao = null;
    form.reset();
    cancelBtn.classList.add("d-none");
    submitBtn.textContent = " Cadastrar";
    const iconSubmit = submitBtn.querySelector("i");
    if (iconSubmit) {
      iconSubmit.className = "fas fa-paper-plane";
    }
    document.getElementById("nome_sola").disabled = false;
    document.getElementById("codigo_sola").disabled = false;
  };

  // Função para popular formulário com dados da sola
  const preencherFormulario = (sola) => {
    document.getElementById("nome_sola").value = sola.nome_sola || "";
    document.getElementById("codigo_sola").value = sola.codigo_sola || "";

    document.getElementById("data_atualizacao").value = "";

    document.getElementById("material_cunho").value = sola.material_cunho || "";
    document.getElementById("material_soleta").value =
      sola.material_soleta || "";

    // Limpar pesos
    for (let numero = 37; numero <= 44; numero++) {
      const solaInput = document.getElementById(`sola_${numero}`);
      const soletaInput = document.getElementById(`soleta_${numero}`);
      const cunhoInput = document.getElementById(`cunho_${numero}`);
      const pigSoletaInput = document.getElementById(`pig_soleta_${numero}`);
      const pigCunhoInput = document.getElementById(`pig_cunho_${numero}`);

      if (solaInput) solaInput.value = "";
      if (soletaInput) soletaInput.value = "";
      if (cunhoInput) cunhoInput.value = "";
      if (pigSoletaInput) pigSoletaInput.value = "";
      if (pigCunhoInput) pigCunhoInput.value = "";
    }

    // Preencher pesos
    if (sola.pesos && Array.isArray(sola.pesos)) {
      sola.pesos.forEach((peso) => {
        if (peso && peso.numero) {
          const solaInput = document.getElementById(`sola_${peso.numero}`);
          const soletaInput = document.getElementById(`soleta_${peso.numero}`);

          if (solaInput && peso.peso_sola) {
            solaInput.value = String(peso.peso_sola).replace(".", ",");
          }
          if (soletaInput && peso.peso_soleta) {
            soletaInput.value = String(peso.peso_soleta).replace(".", ",");
          }

          // Disparar evento input para ativar cálculos
          if (solaInput) {
            solaInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      });
    }

    document.getElementById("nome_sola").disabled = true;
    document.getElementById("codigo_sola").disabled = true;

    // Mostrar botão de cancelar e mudar texto do submit
    cancelBtn.classList.remove("d-none");
    submitBtn.textContent = " Atualizar";
    const iconUpdate = submitBtn.querySelector("i");
    if (iconUpdate) {
      iconUpdate.className = "fas fa-sync-alt";
    }
  };

  // Função para buscar sola
  const buscarSola = async (nome, codigo, silencioso = false) => {
    if (!nome && !codigo) {
      if (!silencioso) {
        showModalSistema({
          titulo: "Atenção",
          conteudo: "Informe o nome ou código da sola para buscar.",
        });
      }
      return;
    }

    try {
      const params = new URLSearchParams();
      if (nome) params.append("nome_sola", nome);
      if (codigo) params.append("codigo_sola", codigo);

      const response = await fetchWithAuth(
        `${BASE_URL}/solas/buscar?${params.toString()}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          if (!silencioso) {
            showModalSistema({
              titulo: "Informação",
              conteudo: "Sola não encontrada.",
            });
          }
        } else {
          const err = await response.json().catch(() => ({}));
          if (!silencioso) {
            throw new Error(err.error || "Erro ao buscar sola");
          }
        }
        return;
      }

      const sola = await response.json();
      solaEmEdicao = sola.id;
      preencherFormulario(sola);
    } catch (err) {
      if (!silencioso) {
        showModalSistema({
          titulo: "Erro",
          conteudo: "Erro ao buscar sola.",
        });
      }
    }
  };

  // Event listener para quando uma sola é selecionada no datalist de nome
  let solaSelectionTimeout;
  nomeSolaInput.addEventListener("change", (e) => {
    clearTimeout(solaSelectionTimeout);
    solaSelectionTimeout = setTimeout(() => {
      const nome = nomeSolaInput.value.trim();
      if (nome) {
        buscarSola(nome, "", true);
      }
    }, 100);
  });

  // Permitir busca com Enter no campo de nome (com feedback ao usuário)
  nomeSolaInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nome = nomeSolaInput.value.trim();
      if (nome) {
        buscarSola(nome, "", false);
      }
    }
  });

  let codigoSelectionTimeout;
  codigoSolaInput.addEventListener("change", (e) => {
    // Usar timeout para garantir que o valor foi atualizado
    clearTimeout(codigoSelectionTimeout);
    codigoSelectionTimeout = setTimeout(() => {
      const codigo = codigoSolaInput.value.trim();
      if (codigo) {
        buscarSola("", codigo, true);
      }
    }, 100);
  });

  // Event listener para busca no campo de código com Enter
  codigoSolaInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const codigo = codigoSolaInput.value.trim();
      if (codigo) {
        buscarSola("", codigo, false);
      }
    }
  });

  // Cancelar edição
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    limparEdicao();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (submitBtn) submitBtn.disabled = true;

    const nome_sola = document.getElementById("nome_sola").value.trim();
    let codigo_sola = document.getElementById("codigo_sola").value.trim();
    const data_atualizacao = document.getElementById("data_atualizacao").value;
    const material_cunho = document.getElementById("material_cunho").value;
    const material_soleta = document.getElementById("material_soleta").value;

    // Normalizar código_sola para maiúsculas
    codigo_sola = codigo_sola.toUpperCase();

    if (!nome_sola || !codigo_sola || !data_atualizacao || !material_cunho) {
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
          peso_sola: peso_sola ? parseFloat(peso_sola.replace(",", ".")) : null,
          peso_soleta: peso_soleta
            ? parseFloat(peso_soleta.replace(",", "."))
            : null,
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
      let response;
      let endpoint = `${BASE_URL}/solas`;
      let method = "POST";

      if (solaEmEdicao) {
        endpoint = `${BASE_URL}/solas/${solaEmEdicao}`;
        method = "PUT";
      }

      response = await fetchWithAuth(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_sola: !solaEmEdicao ? nome_sola : undefined,
          codigo_sola: !solaEmEdicao ? codigo_sola : undefined,
          data_atualizacao,
          material_cunho,
          material_soleta,
          pesos,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        form.reset();
        limparEdicao();

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
        conteudo: "Erro ao atualizar sola.",
      });
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
