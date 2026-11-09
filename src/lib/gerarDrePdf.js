import jsPDF from "jspdf";

const NOMES_MES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function formatarReal(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/**
 * Gera o PDF da Contabilidade (DRE simplificado + relatório de entradas/saídas do mês)
 * e dispara o download no navegador.
 *
 * @param {Object} params
 * @param {number} params.mes
 * @param {number} params.ano
 * @param {{ vendas:number, impostos:number, despesas:number, resultado:number }} params.dre
 * @param {Array} params.lancamentos - lista vinda de listarLancamentos({ mes, ano })
 */
export function gerarDrePdf({ mes, ano, dre, lancamentos }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margem = 20;
  const direita = 190;
  let y = 20;
  const teveLucro = dre.resultado >= 0;

  // Selo de simulação — mesmo padrão da nota fiscal
  doc.setFillColor(255, 243, 205);
  doc.rect(margem, y, 170, 10, "F");
  doc.setFontSize(9);
  doc.setTextColor(120, 90, 0);
  doc.text("DOCUMENTO SIMULADO — PROJETO ACADÊMICO", margem + 5, y + 6.5);
  y += 20;

  // Cabeçalho
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Demonstração do Resultado (DRE)", margem, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Letrando Tecnologia Educacional · Competência: ${NOMES_MES[mes - 1]}/${ano}`, margem, y);
  y += 12;

  doc.setDrawColor(200, 200, 200);
  doc.line(margem, y, direita, y);
  y += 12;

  // Linhas do DRE
  function linha(label, valor, { negrito = false, cor = [20, 20, 20] } = {}) {
    doc.setFont(undefined, negrito ? "bold" : "normal");
    doc.setFontSize(11);
    doc.setTextColor(...cor);
    doc.text(label, margem, y);
    doc.text(formatarReal(valor), direita, y, { align: "right" });
    y += 8;
  }

  linha("(+) Vendas (entradas do Financeiro)", dre.vendas);
  linha("(−) Impostos (DAS apurado no Fiscal)", dre.impostos, { cor: [154, 76, 0] });
  linha("(−) Despesas (saídas do Financeiro)", dre.despesas, { cor: [163, 60, 60] });

  doc.line(margem, y, direita, y);
  y += 9;

  linha(
    teveLucro ? "(=) LUCRO DO MÊS" : "(=) PREJUÍZO DO MÊS",
    Math.abs(dre.resultado),
    { negrito: true, cor: teveLucro ? [47, 122, 79] : [163, 60, 60] }
  );
  doc.setTextColor(20, 20, 20);
  y += 10;

  // Relatório de entradas e saídas
  if (lancamentos && lancamentos.length > 0) {
    doc.setFont(undefined, "bold");
    doc.setFontSize(12);
    doc.text("Relatório de entradas e saídas", margem, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text("Data", margem, y);
    doc.text("Tipo", margem + 25, y);
    doc.text("Origem / categoria", margem + 50, y);
    doc.text("Valor", direita, y, { align: "right" });
    y += 2;
    doc.line(margem, y, direita, y);
    y += 6;

    doc.setFont(undefined, "normal");
    lancamentos.forEach((l) => {
      if (y > 275) { doc.addPage(); y = 20; }
      const origem = l.tipo === "entrada" && l.municipio?.nome ? `${l.municipio.nome} — ${l.categoria}` : l.categoria;
      doc.setTextColor(l.tipo === "entrada" ? 47 : 163, l.tipo === "entrada" ? 122 : 60, l.tipo === "entrada" ? 79 : 60);
      doc.text(formatarData(l.data_lancamento), margem, y);
      doc.text(l.tipo === "entrada" ? "Entrada" : "Saída", margem + 25, y);
      doc.setTextColor(20, 20, 20);
      doc.text(String(origem).slice(0, 38), margem + 50, y);
      doc.text(`${l.tipo === "entrada" ? "+" : "−"} ${formatarReal(l.valor)}`, direita, y, { align: "right" });
      y += 6;
    });
  }

  doc.save(`DRE-${NOMES_MES[mes - 1]}-${ano}.pdf`);
}
