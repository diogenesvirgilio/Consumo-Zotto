import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./services/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";

export async function carregarSolas(selectEl, selecionadoId = null) {
  if (!selectEl) return;

  try {
    const response = await fetchWithAuth(`${BASE_URL}/solas`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao carregar solas");
    }

    const solas = await response.json();

    selectEl.innerHTML = `<option value="">Selecione...</option>`;

    solas.forEach((sola) => {
      const opt = document.createElement("option");
      opt.value = sola.id;
      opt.textContent = sola.nome_sola || `Sola #${sola.id}`;
      opt.dataset.codigo = sola.codigo_sola;

      if (selecionadoId && String(sola.id) === String(selecionadoId)) {
        opt.selected = true;
      }

      selectEl.appendChild(opt);
    });
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: "Não foi possível carregar solas.",
    });
  }
}

export async function carregarCodigosSolas(selectEl, selecionadoId = null) {
  if (!selectEl) return;

  try {
    const response = await fetchWithAuth(`${BASE_URL}/solas`);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao carregar códigos de solas");
    }

    const solas = await response.json();

    selectEl.innerHTML = `<option value="">Selecione...</option>`;

    solas.forEach((sola) => {
      const opt = document.createElement("option");
      opt.value = sola.id;
      opt.textContent = sola.codigo_sola || `Código #${sola.id}`;
      opt.dataset.nome = sola.nome_sola;

      if (selecionadoId && String(sola.id) === String(selecionadoId)) {
        opt.selected = true;
      }

      selectEl.appendChild(opt);
    });
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: "Não foi possível carregar códigos de solas.",
    });
  }
}

export async function getSolaComPesos(solaId) {
  if (!solaId) return null;

  try {
    const response = await fetchWithAuth(`${BASE_URL}/solas/${solaId}`);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Erro ao carregar sola");
    }

    const sola = await response.json();
    return sola;
  } catch (err) {
    console.error("Erro ao carregar sola com pesos:", err);
    return null;
  }
}
