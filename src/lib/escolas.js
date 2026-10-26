import { supabase } from "@/lib/supabaseClient";

function gerarCodigoAcesso(nomeEscola) {
  const ano = new Date().getFullYear();
  const sufixo = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ESC-${ano}-${sufixo}`;
}

// --- Municípios (agora são os clientes que pagam assinatura) ---

export async function listarMunicipiosComAssinatura() {
  const { data: municipios, error } = await supabase
    .from("municipio")
    .select("id, nome, uf, cnpj, valor_mensal, status_assinatura, data_vencimento, escola(id)")
    .order("nome");
  if (error) throw error;

  return (municipios ?? []).map((m) => ({
    ...m,
    qtdEscolas: m.escola?.length ?? 0,
  }));
}

export async function criarMunicipioComAssinatura({ nome, uf, cnpj, valorMensal, dataVencimento, statusAssinatura }) {
  const { data, error } = await supabase
    .from("municipio")
    .insert({
      nome, uf, cnpj,
      valor_mensal: valorMensal,
      data_vencimento: dataVencimento,
      status_assinatura: statusAssinatura || "pago",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function atualizarMunicipio(id, campos) {
  const { data, error } = await supabase
    .from("municipio")
    .update(campos)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Escolas (operacional: professores/alunos, ligadas a um município) ---

export async function listarEscolas() {
  const { data: escolas, error } = await supabase
    .from("escola")
    .select(`id, nome, cnpj, codigo_acesso, municipio_id, municipio ( id, nome, uf, valor_mensal )`)
    .order("nome");

  if (error) throw error;
  if (!escolas || escolas.length === 0) return [];

  const escolaIds = escolas.map((e) => e.id);

  const { data: professores, error: errProf } = await supabase
    .from("professor")
    .select("escola_id")
    .in("escola_id", escolaIds);
  if (errProf) throw errProf;

  const { data: turmas, error: errTurmas } = await supabase
    .from("turma")
    .select("id, escola_id")
    .in("escola_id", escolaIds);
  if (errTurmas) throw errTurmas;

  const turmaIds = (turmas ?? []).map((t) => t.id);
  let alunos = [];
  if (turmaIds.length > 0) {
    const { data: alunosData, error: errAlunos } = await supabase
      .from("aluno")
      .select("id, turma_id")
      .in("turma_id", turmaIds);
    if (errAlunos) throw errAlunos;
    alunos = alunosData ?? [];
  }

  const turmaParaEscola = Object.fromEntries((turmas ?? []).map((t) => [t.id, t.escola_id]));

  return escolas.map((e) => ({
    ...e,
    totalProfessores: (professores ?? []).filter((p) => p.escola_id === e.id).length,
    totalAlunos: alunos.filter((a) => turmaParaEscola[a.turma_id] === e.id).length,
  }));
}

export async function criarEscola({ nome, cnpj, municipioId }) {
  const { data, error } = await supabase
    .from("escola")
    .insert({
      nome,
      cnpj,
      municipio_id: municipioId,
      codigo_acesso: gerarCodigoAcesso(nome),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarEscola(id, campos) {
  const { data, error } = await supabase
    .from("escola")
    .update(campos)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
