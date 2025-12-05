import { BASE_URL } from "../api/config.js";
import { showModalSistema } from "../utils/modalService.js";
import { fetchWithAuth } from "../api/authRefresh.js";
import { getUserFromToken } from "../utils/auth.js";

export async function carregarFaltas() {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/faltas`);
    const faltas = await response.json();
    preencherTabela(faltas);
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: "Erro ao carregar faltas.",
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userNameDisplay");
  const user = getUserFromToken();

  if (!user) {
    showModalSistema({
      titulo: "Acesso Negado",
      conteudo: "Você precisa estar autenticado para acessar esta página.",
    });
    setTimeout(() => {
      window.location.href = "/pages/login.html";
    }, 2000);
    return;
  }

  carregarFaltas();

  if (user) {
    userNameDisplay.textContent = `${user.nome}`;
  } else {
    userNameDisplay.textContent = "Não autenticado";
  }
});

function preencherTabela(faltas) {
  const tbody = document.getElementById("listaFaltas");
  tbody.innerHTML = "";

  if (!faltas || faltas.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='10' class='text-center'>Nenhuma falta encontrada.</td></tr>";
    return;
  }

  faltas.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.materia_prima_nome || ""}</td>
      <td>${u.cortador_nome || ""}</td>
      <td>${u.falta || ""}</td>
      <td>${u.data ? new Date(u.data).toLocaleDateString() : ""}</td>
      <td>${u.dia_reuniao || ""}</td>
      <td>${u.programacao || ""}</td>
      <td>${u.requisicao || ""}</td>
      <td>${u.obs || ""}</td>
      <td>
        <button class="btn btn-warning btn-sm btn-editar" data-id="${u.id}">
          <i class="fas fa-edit"></i>
        </button>
      </td>
      <td>
        <button class="btn btn-danger btn-sm btn-excluir" data-id="${u.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  adicionarEventosExcluir();
  adicionarEventosEditar();
}

function adicionarEventosExcluir() {
  const botoesExcluir = document.querySelectorAll(".btn-excluir");
  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", async (e) => {
      const id = e.target.closest("button").getAttribute("data-id");
      showModalSistema({
        titulo: "Confirmação",
        conteudo: "Deseja excluir esta falta?",
        confirmacao: true,
        callbackConfirmar: async () => {
          try {
            await fetchWithAuth(`${BASE_URL}/faltas/${id}`, {
              method: "DELETE",
            });
            const modalEl = document.getElementById("modalSistema");
            modalEl.addEventListener("hidden.bs.modal", function handler() {
              carregarFaltas();
              modalEl.removeEventListener("hidden.bs.modal", handler);
            });
          } catch (err) {
            showModalSistema({
              titulo: "Erro",
              conteudo: err?.message || "Erro ao excluir falta.",
            });
          }
        },
      });
    });
  });
}

function adicionarEventosEditar() {
  const botoesEditar = document.querySelectorAll(".btn-editar");

  botoesEditar.forEach((botao) => {
    botao.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      const id = btn.getAttribute("data-id");
      const linha = btn.closest("tr");

      const jaEditando = document.querySelector("tr.editando");
      if (jaEditando && jaEditando !== linha) {
        showModalSistema({
          titulo: "Aviso",
          conteudo: "Finalize a edição.",
        });
        return;
      }

      if (linha.classList.contains("editando")) {
        await salvarEdicaoFalta(linha, id);
        return;
      }

      try {
        // Buscar faltas, matérias primas e cortadores
        const faltasResponse = await fetchWithAuth(`${BASE_URL}/faltas`);
        const faltas = await faltasResponse.json();
        const falta = faltas.find((f) => f.id == id);

        const materiasResponse = await fetchWithAuth(`${BASE_URL}/materiaprima`);
        const materias = await materiasResponse.json();

        const cortadoresResponse = await fetchWithAuth(`${BASE_URL}/cortadores`);
        const cortadores = await cortadoresResponse.json();

        if (!falta) {
          throw new Error("Falta não encontrada.");
        }

        linha.classList.add("editando");

        const tds = linha.querySelectorAll("td");
        const faltaQtd = tds[2].textContent.trim();
        const data = tds[3].textContent.trim();
        const diaReuniao = tds[4].textContent.trim();
        const programacao = tds[5].textContent.trim();
        const requisicao = tds[6].textContent.trim();
        const obs = tds[7].textContent.trim();

        // Criar select de matéria prima
        let materiasSelect = '<select class="form-select form-select-sm" id="editMateriaPrima-' + id + '">';
        materias.forEach((m) => {
          const selected = m.id === falta.materia_prima_id ? "selected" : "";
          materiasSelect += `<option value="${m.id}" ${selected}>${m.nome || m.descricao}</option>`;
        });
        materiasSelect += "</select>";

        // Criar select de cortador
        let cortadoresSelect = '<select class="form-select form-select-sm" id="editCortador-' + id + '"><option value="">Nenhum</option>';
        cortadores.forEach((c) => {
          const selected = c.id === falta.cortador_id ? "selected" : "";
          cortadoresSelect += `<option value="${c.id}" ${selected}>${c.nome}</option>`;
        });
        cortadoresSelect += "</select>";

        tds[0].innerHTML = materiasSelect;
        tds[1].innerHTML = cortadoresSelect;
        tds[2].innerHTML = `<input type="text" class="form-control form-control-sm" value="${faltaQtd || falta.falta}" id="editFalta-${id}" placeholder="Ex: 10,5">`;
        tds[3].innerHTML = `<input type="date" class="form-control form-control-sm" value="${falta.data ? falta.data.split("T")[0] : ""}" id="editData-${id}">`;
        tds[4].innerHTML = `<input type="text" class="form-control form-control-sm" value="${diaReuniao || falta.dia_reuniao || ""}" id="editDiaReuniao-${id}">`;
        tds[5].innerHTML = `<input type="text" class="form-control form-control-sm" value="${programacao || falta.programacao || ""}" id="editProgramacao-${id}">`;
        tds[6].innerHTML = `<input type="text" class="form-control form-control-sm" value="${requisicao || falta.requisicao || ""}" id="editRequisicao-${id}">`;
        tds[7].innerHTML = `<input type="text" class="form-control form-control-sm" value="${obs || falta.obs || ""}" id="editObs-${id}">`;

        tds[8].innerHTML = `
          <button class="btn btn-success btn-sm btn-salvar" data-id="${id}">
            <i class="fas fa-check"></i>
          </button>
        `;

        tds[9].innerHTML = `
          <button class="btn btn-secondary btn-sm btn-cancelar" data-id="${id}">
            <i class="fas fa-times"></i>
          </button>
        `;

        linha
          .querySelector(".btn-salvar")
          .addEventListener("click", async () => {
            await salvarEdicaoFalta(linha, id);
          });

        linha.querySelector(".btn-cancelar").addEventListener("click", () => {
          carregarFaltas();
        });
      } catch (err) {
        showModalSistema({
          titulo: "Erro",
          conteudo: err?.message || "Erro ao carregar dados da falta.",
        });
      }
    });
  });
}

async function salvarEdicaoFalta(linha, id) {
  const materiaPrimaId = document
    .getElementById(`editMateriaPrima-${id}`)
    .value.trim();
  const cortadorId = document.getElementById(`editCortador-${id}`).value.trim();
  const falta = document.getElementById(`editFalta-${id}`).value.trim();
  const data = document.getElementById(`editData-${id}`).value.trim();
  const diaReuniao = document
    .getElementById(`editDiaReuniao-${id}`)
    .value.trim();
  const programacao = document
    .getElementById(`editProgramacao-${id}`)
    .value.trim();
  const requisicao = document
    .getElementById(`editRequisicao-${id}`)
    .value.trim();
  const obs = document.getElementById(`editObs-${id}`).value.trim();

  // Validações
  if (!materiaPrimaId || !falta || !data) {
    showModalSistema({
      titulo: "Aviso",
      conteudo:
        "Preencha os campos obrigatórios (Matéria Prima, Falta e Data).",
    });
    return;
  }

  // Validar se falta é um número decimal válido
  const faltaNormalizado = normalizarDecimal(falta);
  if (!validarDecimal(faltaNormalizado)) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Falta deve ser um número válido (ex: 10,5 ou 10.5).",
    });
    return;
  }

  try {
    const response = await fetchWithAuth(`${BASE_URL}/faltas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        materiaPrimaId: Number(materiaPrimaId),
        cortadorId: cortadorId ? Number(cortadorId) : null,
        falta: faltaNormalizado,
        data,
        diaReuniao,
        programacao,
        requisicao,
        obs,
      }),
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.message || "Erro ao atualizar falta.");
    }

    showModalSistema({
      titulo: "Sucesso",
      conteudo: "Falta atualizada com sucesso!",
    });

    const modalEl = document.getElementById("modalSistema");
    modalEl.addEventListener("hidden.bs.modal", function handler() {
      carregarFaltas();
      modalEl.removeEventListener("hidden.bs.modal", handler);
    });
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: err?.message || "Erro ao salvar alterações.",
    });
  }
}

function normalizarDecimal(valor) {
  if (!valor) return valor;
  // Remove espaços
  valor = valor.trim();
  // Remove pontos (separadores de milhares)
  valor = valor.replace(/\./g, "");
  // Substitui vírgula por ponto (separador decimal)
  valor = valor.replace(",", ".");
  return valor;
}

function validarDecimal(valor) {
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(valor.toString());
}
