import jsPDF from "jspdf";

function formatarReal(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/**
 * Gera um PDF simples no formato de NFS-e
 //dispara o download no navegador.
 * 
 *
 * @param {Object} params
 * @param {Object} params.nota - registro de nota_fiscal 
 * @param {string} params.municipioNome - nome do município/escola tomador do serviço
 * @param {number} [params.aliquotaIss=5] - percentagem do imposto
 */
export function gerarNotaFiscalPdf({ nota, municipioNome, aliquotaIss = 5}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margem = 20;
  let y = 20;

  // Selo de simulação
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

  // Prestador 
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

// imposto
  const valorServico = nota.valor || 0;
  const baseCalculo = valorServico; 
  const valorIss = (baseCalculo * aliquotaIss) / 100;
  const issRetido = 0; // Se houver retenção, alterar aqui <-----

  doc.setFont(undefined, "bold");
  doc.text("VALORES E IMPOSTOS (ISS)", margem, y);
  y += 6;
  doc.setFont(undefined, "normal");
  doc.text(`Valor do Serviço: ${formatarReal(valorServico)}`, margem, y);
  doc.text(`Base de Cálculo: ${formatarReal(baseCalculo)}`, margem + 85, y);
  y += 6;
  doc.text(`Alíquota: ${aliquotaIss}%`, margem, y);
  doc.text(`Valor do ISS: ${formatarReal(valorIss)}`, margem + 85, y);
  y += 6;
  doc.text(`ISS Retido: ${formatarReal(issRetido)}`, margem, y);
  y += 12;

  doc.line(margem, y, 190, y);
  y += 10;


// valor total
  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.text(`Valor total: ${formatarReal(nota.valor)}`, margem, y);

  doc.save(`NFS-e-${nota.numero || nota.id}.pdf`);
}