import jsPDF from "jspdf";

function formatarReal(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/**
 * Gera um PDF simples no formato de NFS-e e dispara o download no navegador.
 * ⚠️ Documento SIMULADO (projeto acadêmico) — sem validade fiscal real.
 *
 * @param {Object} params
 * @param {Object} params.nota - registro de nota_fiscal (numero, data_emissao, valor, codigo_verificacao, serie)
 * @param {string} params.municipioNome - nome do município/escola tomador do serviço
 */
export function gerarNotaFiscalPdf({ nota, municipioNome }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margem = 20;
  let y = 20;

  // Selo de simulação — deixa claro que não é documento fiscal real
  doc.setFillColor(255, 243, 205);
  doc.rect(margem, y, 170, 10, "F");
  doc.setFontSize(9);
  doc.setTextColor(120, 90, 0);
  doc.text("DOCUMENTO SIMULADO — SEM VALIDADE FISCAL (projeto acadêmico)", margem + 5, y + 6.5);
  y += 20;

  // Cabeçalho
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Nota Fiscal de Serviços Eletrônica (NFS-e)", margem, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Número: ${nota.numero || "—"}`, margem, y);
  doc.text(`Série: ${nota.serie || "1"}`, margem + 90, y);
  y += 6;
  doc.text(`Data de emissão: ${formatarData(nota.data_emissao)}`, margem, y);
  y += 6;
  doc.text(`Código de verificação: ${nota.codigo_verificacao || "—"}`, margem, y);
  y += 12;

  doc.setDrawColor(200, 200, 200);
  doc.line(margem, y, 190, y);
  y += 10;

  // Prestador (você, dono do software)
  doc.setFont(undefined, "bold");
  doc.text("PRESTADOR DE SERVIÇOS", margem, y);
  y += 6;
  doc.setFont(undefined, "normal");
  doc.text("Letrando Tecnologia Educacional", margem, y);
  y += 5;
  doc.text("CNPJ: 00.000.000/0001-00 (fictício)", margem, y);
  y += 12;

  // Tomador
  doc.setFont(undefined, "bold");
  doc.text("TOMADOR DE SERVIÇOS", margem, y);
  y += 6;
  doc.setFont(undefined, "normal");
  doc.text(municipioNome || "—", margem, y);
  y += 12;

  doc.line(margem, y, 190, y);
  y += 10;

  // Discriminação do serviço
  doc.setFont(undefined, "bold");
  doc.text("DISCRIMINAÇÃO DO SERVIÇO", margem, y);
  y += 6;
  doc.setFont(undefined, "normal");
  doc.text("Licenciamento de uso de software (SaaS) — plataforma Letrando", margem, y);
  y += 12;

  doc.line(margem, y, 190, y);
  y += 10;

  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.text(`Valor total: ${formatarReal(nota.valor)}`, margem, y);

  doc.save(`NFS-e-${nota.numero || nota.id}.pdf`);
}