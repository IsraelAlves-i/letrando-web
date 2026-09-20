import { supabase } from "@/lib/supabaseClient";

export async function listarRegistrosCusto(escolaId, quantidadeMeses = 6) {
  const { data, error } = await supabase
    .from("registro_custo")
    .select("*")
    .eq("escola_id", escolaId)
    .order("ano", { ascending: false })
    .order("mes", { ascending: false })
    .limit(quantidadeMeses);

  if (error) throw error;
  return (data ?? []).reverse();
}

export async function criarRegistroCusto({ escolaId, mes, ano, custoTotal, totalAlunosAtivos, limiarAlerta }) {
  const { data, error } = await supabase
    .from("registro_custo")
    .insert({
      escola_id: escolaId,
      mes,
      ano,
      custo_total: custoTotal,
      total_alunos_ativos: totalAlunosAtivos,
      limiar_alerta: limiarAlerta ?? 0.5,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}