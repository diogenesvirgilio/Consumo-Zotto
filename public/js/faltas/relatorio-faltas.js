import { BASE_URL } from "../api/config.js";
import { showModalSistema } from "../services/modalService.js";
import { fetchWithAuth } from "../api/authRefresh.js";
import { getUserFromToken } from "../services/auth.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

let todasAsFaltas = [];
let programacoesSelecionadas = new Set();
let todasAsProgramacoes = [];
let programacoesComContagem = {};

async function carregarProgramacoes() {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/faltas`);
    if (!response.ok) {
      throw new Error("Erro ao carregar faltas");
    }

    todasAsFaltas = await response.json();

    // Extrair programações únicas e contar registros por programação
    const programacoes = new Map();
    todasAsFaltas.forEach((f) => {
      if (f.programacao) {
        programacoes.set(
          f.programacao,
          (programacoes.get(f.programacao) || 0) + 1,
        );
      }
    });

    // Ordenar por ordem alfabetica
    todasAsProgramacoes = Array.from(programacoes.keys()).sort();
    programacoesComContagem = Object.fromEntries(programacoes);

    renderizarProgramacoes(todasAsProgramacoes);
  } catch (err) {
    showModalSistema({
      titulo: "Erro",
      conteudo: "Não foi possível carregar as programações.",
    });
    console.error(err);
  }
}

function renderizarProgramacoes(
  programacoesParaRenderizar = todasAsProgramacoes,
) {
  const container = document.getElementById("programacoesContainer");
  container.innerHTML = "";

  if (programacoesParaRenderizar.length === 0) {
    container.innerHTML =
      '<div class="no-results"><i class="fas fa-search"></i> Nenhuma programação encontrada.</div>';
    return;
  }

  programacoesParaRenderizar.forEach((prog) => {
    const div = document.createElement("div");
    div.className = "programacao-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `prog-${prog}`;
    checkbox.value = prog;
    checkbox.dataset.programacao = prog;
    checkbox.checked = programacoesSelecionadas.has(prog);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        programacoesSelecionadas.add(prog);
      } else {
        programacoesSelecionadas.delete(prog);
      }
      atualizarContadorSelecionadas();
    });

    const label = document.createElement("label");
    label.htmlFor = `prog-${prog}`;
    label.textContent = prog;

    const count = document.createElement("span");
    count.className = "programacao-item-count";
    count.textContent = `${programacoesComContagem[prog]} registro${programacoesComContagem[prog] !== 1 ? "s" : ""}`;

    div.appendChild(checkbox);
    div.appendChild(label);
    div.appendChild(count);

    container.appendChild(div);
  });
}

function filtrarProgramacoes(texto) {
  const textoBusca = texto.toLowerCase().trim();

  if (textoBusca === "") {
    renderizarProgramacoes(todasAsProgramacoes);
    return;
  }

  const filtradas = todasAsProgramacoes.filter((prog) =>
    prog.toLowerCase().includes(textoBusca),
  );

  renderizarProgramacoes(filtradas);
}

function atualizarContadorSelecionadas() {
  const count = programacoesSelecionadas.size;
  document.getElementById("selectedCountDisplay").textContent =
    `${count} selecionada${count !== 1 ? "s" : ""}`;
}

function selecionarTodas() {
  programacoesSelecionadas.clear();
  todasAsProgramacoes.forEach((prog) => {
    programacoesSelecionadas.add(prog);
  });

  // Atualizar checkboxes visíveis
  document
    .querySelectorAll(".programacao-item input[type='checkbox']")
    .forEach((checkbox) => {
      checkbox.checked = true;
    });

  atualizarContadorSelecionadas();
}

function limparSelecao() {
  programacoesSelecionadas.clear();

  document
    .querySelectorAll(".programacao-item input[type='checkbox']")
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  atualizarContadorSelecionadas();
}

function gerarRelatorio() {
  if (programacoesSelecionadas.size === 0) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Selecione pelo menos uma programação para gerar o relatório.",
    });
    return;
  }

  // Filtrar faltas pelas programações selecionadas
  const faltasFiltradas = todasAsFaltas.filter((f) =>
    programacoesSelecionadas.has(f.programacao),
  );

  if (faltasFiltradas.length === 0) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Nenhuma falta encontrada para as programações selecionadas.",
    });
    return;
  }

  // Calcular resumo estatístico
  const totalFaltas = faltasFiltradas.reduce(
    (sum, f) => sum + parseFloat(f.falta || 0),
    0,
  );
  const datas = faltasFiltradas
    .map((f) => new Date(f.data))
    .filter((d) => !isNaN(d));
  const dataMin = datas.length > 0 ? new Date(Math.min(...datas)) : null;
  const dataMax = datas.length > 0 ? new Date(Math.max(...datas)) : null;

  // Atualizar resumo
  document.getElementById("totalRegistros").textContent =
    faltasFiltradas.length;
  document.getElementById("totalFaltas").textContent = totalFaltas.toFixed(2);
  document.getElementById("programacoesCount").textContent =
    programacoesSelecionadas.size;

  if (dataMin && dataMax) {
    const dataMinStr = dataMin.toLocaleDateString("pt-BR");
    const dataMaxStr = dataMax.toLocaleDateString("pt-BR");
    document.getElementById("dataRangeLabel").textContent =
      `${dataMinStr} a ${dataMaxStr}`;
  }

  // Agrupar e somar faltas por matéria prima
  const faltasAgrupadas = {};
  faltasFiltradas.forEach((falta) => {
    const materiaNome = falta.materia_prima_nome || "-";
    if (!faltasAgrupadas[materiaNome]) {
      faltasAgrupadas[materiaNome] = 0;
    }
    faltasAgrupadas[materiaNome] += parseFloat(falta.falta || 0);
  });

  // Preencher tabela com dados agrupados
  const tbody = document.getElementById("relatorioTableBody");
  tbody.innerHTML = "";

  Object.entries(faltasAgrupadas).forEach(([materiaNome, totalFalta]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${materiaNome}</td>
      <td>${totalFalta.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Mostrar tabela e resumo
  document.getElementById("resumoSection").classList.remove("d-none");
  document.getElementById("relatorioTableContainer").classList.remove("d-none");

  // Armazenar dados para exportação
  window.relatorioData = faltasFiltradas;
  window.faltasAgrupadas = faltasAgrupadas;
}

function exportarCSV() {
  if (!window.relatorioData || window.relatorioData.length === 0) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Nenhum dado para exportar.",
    });
    return;
  }

  const headers = ["Matéria Prima", "Falta (Qtd)"];

  // Usar dados agrupados
  const rows = Object.entries(window.faltasAgrupadas || {}).map(
    ([materiaNome, totalFalta]) => [materiaNome, totalFalta.toFixed(2)],
  );

  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `relatorio-faltas-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

function exportarPDF() {
  if (!window.relatorioData || window.relatorioData.length === 0) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Nenhum dado para exportar.",
    });
    return;
  }

  showModalSistema({
    titulo: "Exportar PDF",
    conteudo: "Usar a função Imprimir (Ctrl+P) para salvar como PDF.",
  });
  window.print();
}

function exportarExcel() {
  if (!window.relatorioData || window.relatorioData.length === 0) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Nenhum dado para exportar.",
    });
    return;
  }

  // Preparar dados para Excel
  const dados = Object.entries(window.faltasAgrupadas || {}).map(
    ([materiaNome, totalFalta]) => ({
      "Matéria Prima": materiaNome,
      "Falta (Qtd)": totalFalta,
    }),
  );

  // Criar worksheet
  const worksheet = XLSX.utils.json_to_sheet(dados);

  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].z = "#,##0.00_);(#,##0.00)";
    }
  }
  // Adicionar largura de colunas
  const colWidths = [
    { wch: 30 }, // Coluna Matéria Prima
    { wch: 15 }, // Coluna Falta (Qtd)
  ];
  worksheet["!cols"] = colWidths;

  // Criar workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Faltas");

  // Exportar arquivo
  XLSX.writeFile(
    workbook,
    `relatorio-faltas-${new Date().toISOString().split("T")[0]}.xlsx`,
  );
}

function voltarAoInicio() {
  programacoesSelecionadas.clear();
  document.getElementById("resumoSection").classList.add("d-none");
  document.getElementById("relatorioTableContainer").classList.add("d-none");
  document.getElementById("pesquisaProgramacao").value = "";
  atualizarContadorSelecionadas();
  renderizarProgramacoes(todasAsProgramacoes);
}

document.addEventListener("DOMContentLoaded", () => {
  const userNameDisplay = document.getElementById("userNameDisplay");
  const user = getUserFromToken();

  if (user) {
    userNameDisplay.textContent = `${user.nome}`;
  } else {
    userNameDisplay.textContent = "Não autenticado";
  }

  carregarProgramacoes();

  // Event listeners
  document
    .getElementById("pesquisaProgramacao")
    .addEventListener("input", (e) => {
      filtrarProgramacoes(e.target.value);
    });

  document
    .getElementById("btnSelecionarTodas")
    .addEventListener("click", selecionarTodas);

  document
    .getElementById("btnLimparSelecao")
    .addEventListener("click", limparSelecao);

  document
    .getElementById("btnGerarRelatorio")
    .addEventListener("click", gerarRelatorio);

  document
    .getElementById("btnExportarCSV")
    .addEventListener("click", exportarCSV);

  document
    .getElementById("btnExportarPDF")
    .addEventListener("click", exportarPDF);

  document
    .getElementById("btnExportarExcel")
    .addEventListener("click", exportarExcel);

  document
    .getElementById("btnVoltar")
    .addEventListener("click", voltarAoInicio);
});
