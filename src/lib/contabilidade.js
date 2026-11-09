import { supabase } from "@/lib/supabaseClient";
import { buscarResumoMensal } from "@/lib/financeiro";

// DRE simplificado (Demonstração do Resultado do Exercício), do mês.
// É montado AUTOMATICAMENTE a partir dos outros módulos — ninguém digita nada aqui:
//
//   Vendas    <- Financeiro: soma das entradas do mês
//   Impostos  <- Fiscal:     DAS apurado para aquele mês (apuracao_tributaria)
//   Despesas  <- Financeiro: soma das saídas do mês
//
//   Resultado = Vendas - Impostos - Despesas   (positivo = lucro, negativo = prejuízo)
export async function buscarDre(mes, ano) {
  const resumo = await buscarResumoMensal(mes, ano);

  const { data: apuracoes, error } = await supabase
    .from("apuracao_tributaria")
    .select("valor_das")
    .eq("mes", mes)
    .eq("ano", ano);
  if (error) throw error;

  const vendas = Number(resumo.entradas_total || 0);
  const despesas = Number(resumo.saidas_total || 0);
  const impostos = (apuracoes ?? []).reduce((acc, a) => acc + Number(a.valor_das || 0), 0);
  const resultado = vendas - impostos - despesas;

  return { vendas, impostos, despesas, resultado };
}
