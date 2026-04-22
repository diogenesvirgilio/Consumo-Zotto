import { BASE_URL } from "./api/config.js";
import { showModalSistema } from "./services/modalService.js";
import { fetchWithAuth } from "./api/authRefresh.js";
import { requireAuth } from "./services/auth-guard.js";
import { carregarSolas, carregarCodigosSolas } from "./solas.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";
import jsPDF from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm";
import "https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/dist/jspdf.plugin.autotable.mjs";

let solaAtual = null;

// Funções de exportação
function exportarPDF() {
  if (!solaAtual || !solaAtual.pesos || solaAtual.pesos.length === 0) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Nenhum dado para exportar.",
    });
    return;
  }

  // Preparar dados para PDF
  const colunas = [
    "Número",
    "Sola",
    "Código",
    "Material Sola",
    "Material Soleta",
    "Data",
    "Peso PAR",
    "Peso SOLETA",
    "PIG SOLETA",
    "Peso CUNHO",
    "PIG CUNHO",
  ];

  const linhas = solaAtual.pesos.map((peso) => {
    const sola_valor = peso.peso_sola || 0;
    const soleta_valor = peso.peso_soleta || 0;
    const cunho_valor = sola_valor - soleta_valor;
    const pig_soleta_valor = (soleta_valor / 100) * 2;
    const pig_cunho_valor = (cunho_valor / 100) * 2;

    let dataFormatada = "-";
    if (solaAtual.data_atualizacao) {
      const data = new Date(solaAtual.data_atualizacao);
      dataFormatada = data.toLocaleDateString("pt-BR");
    }

    return [
      peso.numero,
      solaAtual.nome_sola || "-",
      solaAtual.codigo_sola || "-",
      solaAtual.material_cunho || "-",
      solaAtual.material_soleta || "-",
      dataFormatada,
      sola_valor.toFixed(5).replace(".", ","),
      soleta_valor.toFixed(5).replace(".", ","),
      pig_soleta_valor.toFixed(5).replace(".", ","),
      cunho_valor.toFixed(5).replace(".", ","),
      pig_cunho_valor.toFixed(5).replace(".", ","),
    ];
  });

  // Criar PDF
  const doc = new jsPDF();

  // Adicionar título
  const titulo = `Pesos da Sola: ${solaAtual.nome_sola}`;
  doc.setFontSize(14);
  doc.text(titulo, 10, 10);

  // Adicionar data de geração
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  doc.setFontSize(10);
  doc.text(`Data de Geração: ${dataAtual}`, 10, 18);

  // Adicionar tabela
  doc.autoTable({
    head: [colunas],
    body: linhas,
    startY: 25,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 5,
      halign: "center",
      valign: "middle",
      borders: "grid",
    },
    headStyles: {
      backgroundColor: [0, 102, 204],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      backgroundColor: [240, 248, 255],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { halign: "left", cellWidth: 20 },
      2: { halign: "center", cellWidth: 15 },
      3: { halign: "left", cellWidth: 22 },
      4: { halign: "left", cellWidth: 22 },
      5: { halign: "center", cellWidth: 15 },
      6: { halign: "right", cellWidth: 15 },
      7: { halign: "right", cellWidth: 17 },
      8: { halign: "right", cellWidth: 15 },
      9: { halign: "right", cellWidth: 15 },
      10: { halign: "right", cellWidth: 15 },
    },
  });

  // Adicionar rodapé
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${totalPaginas}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" },
    );
  }

  // Exportar arquivo
  doc.save(
    `pesos-sola-${solaAtual.nome_sola}-${new Date().toISOString().split("T")[0]}.pdf`,
  );
}

function exportarExcel() {
  if (!solaAtual || !solaAtual.pesos || solaAtual.pesos.length === 0) {
    showModalSistema({
      titulo: "Aviso",
      conteudo: "Nenhum dado para exportar.",
    });
    return;
  }

  // Preparar dados para Excel
  const dados = solaAtual.pesos.map((peso) => {
    const sola_valor = peso.peso_sola || 0;
    const soleta_valor = peso.peso_soleta || 0;
    const cunho_valor = sola_valor - soleta_valor;
    const pig_soleta_valor = (soleta_valor / 100) * 2;
    const pig_cunho_valor = (cunho_valor / 100) * 2;

    let dataFormatada = "-";
    if (solaAtual.data_atualizacao) {
      const data = new Date(solaAtual.data_atualizacao);
      dataFormatada = data.toLocaleDateString("pt-BR");
    }

    return {
      Número: peso.numero,
      Sola: solaAtual.nome_sola || "-",
      Código: solaAtual.codigo_sola || "-",
      "Material Sola": solaAtual.material_cunho || "-",
      "Material Soleta": solaAtual.material_soleta || "-",
      Data: dataFormatada,
      "Peso PAR": parseFloat(sola_valor.toString().replace(",", ".")),
      "Peso SOLETA": parseFloat(soleta_valor.toString().replace(",", ".")),
      "PIG SOLETA": parseFloat(pig_soleta_valor.toString().replace(",", ".")),
      "Peso CUNHO": parseFloat(cunho_valor.toString().replace(",", ".")),
      "PIG CUNHO": parseFloat(pig_cunho_valor.toString().replace(",", ".")),
    };
  });

  // Criar worksheet
  const worksheet = XLSX.utils.json_to_sheet(dados);

  // Adicionar largura de colunas
  const colWidths = [
    { wch: 10 }, // Número
    { wch: 15 }, // Sola
    { wch: 12 }, // Código
    { wch: 18 }, // Material Sola
    { wch: 18 }, // Material Soleta
    { wch: 12 }, // Data
    { wch: 12 }, // Peso PAR
    { wch: 14 }, // Peso SOLETA
    { wch: 12 }, // PIG SOLETA
    { wch: 12 }, // Peso CUNHO
    { wch: 12 }, // PIG CUNHO
  ];
  worksheet["!cols"] = colWidths;

  // Formatar números com 5 casas decimais
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    for (let col = 6; col <= 10; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].z = "0.00000";
      }
    }
  }

  // Criar workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    `${solaAtual.nome_sola || "Pesos Sola"}`,
  );

  // Exportar arquivo
  XLSX.writeFile(
    workbook,
    `pesos-sola-${solaAtual.nome_sola}-${new Date().toISOString().split("T")[0]}.xlsx`,
  );
}

document.addEventListener("DOMContentLoaded", () => {
  // verfica se o usuário tem permissão de admin
  if (!requireAuth(["admin"])) {
    return;
  }

  const selectNomeSola = document.getElementById("nome_sola");
  const selectCodigoSola = document.getElementById("codigo_sola");
  const btnLimpar = document.getElementById("btnLimparSola");
  const tableBody = document.querySelector("table tbody");

  // Função para formatar peso com 5 casas decimais
  const formatarPeso = (valor) => {
    if (!valor && valor !== 0) return "-";
    const num =
      typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;
    if (isNaN(num)) return "-";
    return num.toFixed(5).replace(".", ",");
  };

  // Função para limpar a tabela e mostrar mensagem inicial
  const limparTabela = () => {
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="11" class="text-center text-muted py-4">
            <i class="fas fa-info-circle me-2"></i>
            Nenhuma sola pesquisada. Selecione uma sola para visualizar os pesos.
          </td>
        </tr>
      `;
    }
    // Ocultar botões de exportação
    const exportacaoDados = document.getElementById("exportacaoDados");
    if (exportacaoDados) {
      exportacaoDados.classList.add("d-none");
    }
  };

  // Função para popular a tabela com dados da sola
  const preencherTabela = (sola) => {
    if (!tableBody) return;

    // Armazenar dados para exportação
    solaAtual = sola;

    if (!sola || !sola.pesos || sola.pesos.length === 0) {
      limparTabela();
      return;
    }

    let html = "";

    sola.pesos.forEach((peso) => {
      const sola_valor = peso.peso_sola || 0;
      const soleta_valor = peso.peso_soleta || 0;
      const cunho_valor = sola_valor - soleta_valor;
      const pig_soleta_valor = (soleta_valor / 100) * 2;
      const pig_cunho_valor = (cunho_valor / 100) * 2;

      let dataFormatada = "-";
      if (sola.data_atualizacao) {
        const data = new Date(sola.data_atualizacao);
        dataFormatada = data.toLocaleDateString("pt-BR");
      }

      html += `
        <tr>
          <td class="fw-bold">${peso.numero}</td>
          <td>${sola.nome_sola || "-"}</td>
          <td>${sola.codigo_sola || "-"}</td>
          <td>${sola.material_cunho || "-"}</td>
          <td>${sola.material_soleta || "-"}</td>
          <td>${dataFormatada}</td>
          <td class="fw-bold">${formatarPeso(sola_valor)}</td>
          <td>${formatarPeso(soleta_valor)}</td>
          <td>${formatarPeso(pig_soleta_valor)}</td>
          <td>${formatarPeso(cunho_valor)}</td>
          <td>${formatarPeso(pig_cunho_valor)}</td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    // Mostrar botões de exportação
    const exportacaoDados = document.getElementById("exportacaoDados");
    if (exportacaoDados) {
      exportacaoDados.classList.remove("d-none");
    }
  };

  // Função para buscar sola com pesos
  const buscarSola = async (nomeSola, codigoSola, solaId = null) => {
    if (!nomeSola && !codigoSola && !solaId) {
      limparTabela();
      return;
    }

    try {
      let response;

      // Se tem solaId, busca pelo ID (mais direto)
      if (solaId) {
        response = await fetchWithAuth(`${BASE_URL}/solas/${solaId}`);
      } else {
        // Caso contrário, busca por nome ou código
        const params = new URLSearchParams();
        if (nomeSola) params.append("nome_sola", nomeSola);
        if (codigoSola) params.append("codigo_sola", codigoSola);

        response = await fetchWithAuth(
          `${BASE_URL}/solas/buscar?${params.toString()}`,
        );
      }

      if (!response.ok) {
        if (response.status === 404) {
          limparTabela();
          return;
        }
        throw new Error("Erro ao buscar sola");
      }

      const sola = await response.json();
      preencherTabela(sola);
    } catch (err) {
      limparTabela();
    }
  };

  // Carregar solas nos selects
  if (selectNomeSola) {
    carregarSolas(selectNomeSola);
  }

  if (selectCodigoSola) {
    carregarCodigosSolas(selectCodigoSola);
  }

  // Inicializar Select2 para nome da sola
  if (selectNomeSola) {
    $(selectNomeSola).select2({
      theme: "bootstrap-5",
      placeholder: "Buscar sola por nome...",
      allowClear: true,
      language: {
        noResults: function () {
          return "Não encontrado";
        },
      },
      dropdownParent: $("body"),
      width: "100%",
    });

    // Carregar dados quando nome é selecionado
    $(selectNomeSola).on("change", function () {
      const selectedOption =
        selectNomeSola.options[selectNomeSola.selectedIndex];
      const codigoRelacionado = selectedOption?.dataset?.codigo;
      const solaId = selectNomeSola.value;

      // Sincronizar com código
      if (codigoRelacionado && selectCodigoSola) {
        for (let i = 0; i < selectCodigoSola.options.length; i++) {
          if (
            selectCodigoSola.options[i].dataset?.codigo === codigoRelacionado
          ) {
            $(selectCodigoSola)
              .val(selectCodigoSola.options[i].value)
              .trigger("change");
            break;
          }
        }
      }

      // Buscar e carregar pesos pelo ID
      buscarSola(null, null, solaId);
    });
  }

  // Inicializar Select2 para código da sola
  if (selectCodigoSola) {
    $(selectCodigoSola).select2({
      theme: "bootstrap-5",
      placeholder: "Buscar sola por código...",
      allowClear: true,
      language: {
        noResults: function () {
          return "Não encontrado";
        },
      },
      dropdownParent: $("body"),
      width: "100%",
    });

    // Carregar dados quando código é selecionado
    $(selectCodigoSola).on("change", function () {
      const selectedOption =
        selectCodigoSola.options[selectCodigoSola.selectedIndex];
      const nomeRelacionado = selectedOption?.dataset?.nome;
      const solaId = selectCodigoSola.value;

      // Sincronizar com nome
      if (nomeRelacionado && selectNomeSola) {
        for (let i = 0; i < selectNomeSola.options.length; i++) {
          if (selectNomeSola.options[i].textContent === nomeRelacionado) {
            $(selectNomeSola)
              .val(selectNomeSola.options[i].value)
              .trigger("change");
            break;
          }
        }
      }

      // Buscar e carregar pesos pelo ID
      buscarSola(null, null, solaId);
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      if (selectNomeSola) {
        $(selectNomeSola).val(null).trigger("change");
      }
      if (selectCodigoSola) {
        $(selectCodigoSola).val(null).trigger("change");
      }
      limparTabela();
    });
  }

  // Botões de exportação
  const btnExportarPDF = document.getElementById("btnExportarPDF");
  if (btnExportarPDF) {
    btnExportarPDF.addEventListener("click", exportarPDF);
  }

  const btnExportarExcel = document.getElementById("btnExportarExcel");
  if (btnExportarExcel) {
    btnExportarExcel.addEventListener("click", exportarExcel);
  }

  // Inicializar tabela vazia
  limparTabela();
});
