import { supabase } from "@/lib/supabaseClient";

// --- Formas de pagamento e pagamentos ---

export async function listarFormasPagamento(escolaId) {
  const { data, error } = await supabase
    .from("forma_pagamento")
    .select("id, tipo, dados, ativa")
    .eq("escola_id", escolaId)
    .eq("ativa", true)
    .order("tipo");
  if (error) throw error;
  return data;
}

export async function criarFormaPagamento({ escolaId, tipo, dados }) {
  const { data, error } = await supabase
    .from("forma_pagamento")
    .insert({ escola_id: escolaId, tipo, dados, ativa: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function registrarPagamento({ escolaId, valor, dataPagamento, formaPagamentoId }) {
  const { data, error } = await supabase
    .from("pagamento")
    .insert({
      escola_id: escolaId,
      valor,
      data_pagamento: dataPagamento,
      forma_pagamento_id: formaPagamentoId,
      status: "confirmado",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Pagamentos + Notas Fiscais ---

export async function listarPagamentosComNotas(escolaId, mes, ano) {
  let query = supabase
    .from("pagamento")
    .select("id, valor, data_pagamento, status, escola_id")
    .eq("escola_id", escolaId)
    .order("data_pagamento", { ascending: false });

  if (mes && ano) {
    const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
    const fim = new Date(ano, mes, 0).toISOString().slice(0, 10);
    query = query.gte("data_pagamento", inicio).lte("data_pagamento", fim);
  }

  const { data: pagamentos, error: errPag } = await query;
  if (errPag) throw errPag;

  const { data: notas, error: errNotas } = await supabase
    .from("nota_fiscal")
    .select("*")
    .eq("escola_id", escolaId);
  if (errNotas) throw errNotas;

  return (pagamentos ?? []).map((p) => {
    const notasDoPagamento = (notas ?? [])
      .filter((n) => n.pagamento_id === p.id)
      .sort((a, b) => (b.data_emissao ?? "").localeCompare(a.data_emissao ?? ""));
    const notaAtiva = notasDoPagamento.find((n) => n.status !== "cancelada");
    const ultimaCancelada = notasDoPagamento.find((n) => n.status === "cancelada");
    return { ...p, notaAtiva: notaAtiva ?? null, ultimaCancelada: notaAtiva ? null : (ultimaCancelada ?? null) };
  });
}

export async function emitirNota({ pagamentoId, escolaId, valor, numeroRps }) {
  const { data, error } = await supabase
    .from("nota_fiscal")
    .insert({ pagamento_id: pagamentoId, escola_id: escolaId, valor, numero_rps: numeroRps || null, status: "pendente" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function confirmarEmissao(notaId, { numero, codigoVerificacao, linkPdf, linkXml }) {
  const { data, error } = await supabase
    .from("nota_fiscal")
    .update({
      numero,
      codigo_verificacao: codigoVerificacao || null,
      link_pdf: linkPdf || null,
      link_xml: linkXml || null,
      status: "emitida",
      data_emissao: new Date().toISOString().slice(0, 10),
    })
    .eq("id", notaId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cancelarNota(notaId, motivo) {
  const { data, error } = await supabase
    .from("nota_fiscal")
    .update({ status: "cancelada", motivo_cancelamento: motivo, data_cancelamento: new Date().toISOString().slice(0, 10) })
    .eq("id", notaId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function reemitirNota(notaOriginal) {
  const { data, error } = await supabase
    .from("nota_fiscal")
    .insert({
      pagamento_id: notaOriginal.pagamento_id,
      escola_id: notaOriginal.escola_id,
      valor: notaOriginal.valor,
      nota_original_id: notaOriginal.id,
      status: "pendente",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Tributos (apuração mensal / DAS) ---

export async function listarApuracoes(limite = 12) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("apuracao_tributaria")
    .select("*")
    .eq("admin_id", user.id)
    .order("ano", { ascending: false })
    .order("mes", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return (data ?? []).reverse();
}

export async function sugerirReceitaBrutaMes(mes, ano) {
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fim = new Date(ano, mes, 0).toISOString().slice(0, 10);

  // Soma os pagamentos de TODAS as escolas: o DAS é sobre o faturamento
  // total do dono do software, não fatiado por escola/cliente.
  const { data, error } = await supabase
    .from("pagamento")
    .select("valor")
    .eq("status", "confirmado")
    .gte("data_pagamento", inicio)
    .lte("data_pagamento", fim);
  if (error) throw error;
  return (data ?? []).reduce((acc, p) => acc + Number(p.valor), 0);
}

export async function criarApuracao({ mes, ano, receitaBrutaMes, receitaBruta12m, aliquotaEfetiva, dataVencimento }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("apuracao_tributaria")
    .insert({
      admin_id: user.id,
      mes,
      ano,
      receita_bruta_mes: receitaBrutaMes,
      receita_bruta_12m: receitaBruta12m,
      aliquota_efetiva: aliquotaEfetiva,
      data_vencimento: dataVencimento,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function marcarApuracaoComoPaga(id, dataPagamento) {
  const { data, error } = await supabase
    .from("apuracao_tributaria")
    .update({ status: "pago", data_pagamento: dataPagamento })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}