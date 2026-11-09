import { supabase } from "@/lib/supabaseClient";

// Financeiro agora é da EMPRESA TODA (você, dono do software) — não é mais
// fatiado por escola. Entradas vêm de municípios-cliente; saídas são os
// custos de operar o negócio (infra, marketing, suporte etc.).

export const CATEGORIAS_ENTRADA = [
  { valor: "Mensalidade", icone: "🎓" },
  { valor: "Taxa de implantação", icone: "🛠️" },
  { valor: "Outro", icone: "💰" },
];

export const CATEGORIAS_SAIDA = [
  { valor: "Supabase", icone: "🗄️" },
  { valor: "Vercel", icone: "▲" },
];

export function iconeDaCategoria(categoria, tipo) {
  const lista = tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;
  return lista.find((c) => c.valor === categoria)?.icone ?? "•";
}

// --- Municípios (clientes) ---

export async function listarMunicipiosComContagem() {
  const { data, error } = await supabase
    .from("municipio")
    .select("id, nome, uf, escola(count)")
    .order("nome");

  if (error) throw error;
  return (data ?? []).map((m) => ({
    id: m.id,
    nome: m.nome,
    uf: m.uf,
    qtdEscolas: m.escola?.[0]?.count ?? 0,
  }));
}

export async function criarMunicipio({ nome, uf }) {
  const { data, error } = await supabase
    .from("municipio")
    .insert({ nome, uf })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Lançamentos ---

/**
 * @param {Object} filtros
 * @param {number} filtros.mes  - 1 a 12
 * @param {number} filtros.ano
 * @param {'entrada'|'saida'} [filtros.tipo]
 */
export async function listarLancamentos({ mes, ano, tipo }) {
  let query = supabase
    .from("lancamento_financeiro")
    .select("*, municipio(nome, uf)")
    .eq("mes", mes)
    .eq("ano", ano)
    .order("data_lancamento", { ascending: false });

  if (tipo) query = query.eq("tipo", tipo);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function criarLancamento({
  tipo,
  categoria,
  descricao,
  valor,
  dataLancamento,
  municipioId, // só usado quando tipo === "entrada"
}) {
  const data = dataLancamento ? new Date(dataLancamento) : new Date();

  const { data: registro, error } = await supabase
    .from("lancamento_financeiro")
    .insert({
      tipo,
      categoria,
      descricao,
      valor,
      municipio_id: tipo === "entrada" ? municipioId : null,
      mes: data.getMonth() + 1,
      ano: data.getFullYear(),
      data_lancamento: data.toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) throw error;
  return registro;
}

export async function atualizarLancamento(id, campos) {
  const { data, error } = await supabase
    .from("lancamento_financeiro")
    .update(campos)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function excluirLancamento(id) {
  const { error } = await supabase
    .from("lancamento_financeiro")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// --- Resumo / KPIs (via view resumo_financeiro_mensal, empresa toda) ---

export async function buscarResumoMensal(mes, ano) {
  const { data, error } = await supabase
    .from("resumo_financeiro_mensal")
    .select("*")
    .eq("mes", mes)
    .eq("ano", ano)
    .maybeSingle();

  if (error) throw error;
  return data ?? { entradas_total: 0, saidas_total: 0 };
}

export async function buscarFluxoCaixaMensal(quantidadeMeses = 6) {
  const { data, error } = await supabase
    .from("resumo_financeiro_mensal")
    .select("*")
    .order("ano", { ascending: false })
    .order("mes", { ascending: false })
    .limit(quantidadeMeses);

  if (error) throw error;
  return (data ?? []).reverse();
}

// --- Situação das assinaturas (terceira tabela do Financeiro) ---
// Mostra, por município: valor mensal, vencimento e status
// (Pago / Vencido 30 dias / Vencido 60 dias / Cancelado).

export async function listarSituacaoMunicipios() {
  const { data, error } = await supabase
    .from("municipio")
    .select("id, nome, uf, valor_mensal, status_assinatura, data_vencimento")
    .order("nome");

  if (error) throw error;
  return data ?? [];
}
