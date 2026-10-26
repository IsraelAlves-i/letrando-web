import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Letrando] Variáveis do Supabase não configuradas. " +
      "Copie .env.local.example para .env.local e preencha com as chaves do seu projeto."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

// modoDemo
const modoDemo =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes("PROJETO") ||
  supabaseAnonKey.includes("CHAVE");

function respostaDemo(nome, perfil) {
  return {
    data: { user: { id: "demo-user", user_metadata: { nome, perfil } } },
    error: null,
  };
}

// --- Funções de autenticação usadas nas telas de login/cadastro ---

export async function signUpAluno({ nome, email, senha, codigoTurma }) {
  // RF01 - Cadastro de Aluno: cria o usuário no Supabase Auth e, em seguida,
  // grava o vínculo com a turma na tabela `aluno`.
  if (modoDemo) return respostaDemo(nome, "aluno");

  // 1. Buscar a turma pelo código de acesso
  // (exige a policy "publico_pode_validar_codigo_turma" no RLS — ver
  // Letrando_RLS_Fix_Cadastro.sql.
  const { data: turma, error: erroTurma } = await supabase
    .from("turma")
    .select("id, escola_id")
    .eq("codigo_acesso", codigoTurma)
    .single();

  if (erroTurma || !turma) {
    return { data: null, error: { message: "Código de turma inválido." } };
  }

  // 2. Criar o usuário no Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, perfil: "aluno", codigo_turma: codigoTurma } },
  });

  if (error) return { data, error };

  // 3. Gravar na tabela `aluno` usando UPSERT (atualiza se a linha já existir pelo Trigger)
  const { error: erroInsert } = await supabase.from("aluno").upsert(
    {
      id: data.user.id,
      nome,
      email,
      turma_id: turma.id,
    },
    { onConflict: "id" }
  );

  if (erroInsert) {
    return { data: null, error: erroInsert };
  }

  return { data, error: null };
}

export async function signUpProfessor({ nome, email, senha, codigoEscola }) {
  // RF02 - Cadastro de Professor: mesmo padrão de segurança do signUpAluno —
  // valida o código da escola antes de criar a conta, com mensagem clara.
  if (modoDemo) return respostaDemo(nome, "professor");

  // 1. Buscar a escola pelo código de acesso e checar se a assinatura está ativa
  // (exige a policy "publico_pode_validar_codigo_escola" no RLS)
  const { data: escola, error: erroEscola } = await supabase
    .from("escola")
    .select("id, nome, status_assinatura")
    .eq("codigo_acesso", codigoEscola)
    .single();

  if (erroEscola || !escola) {
    return { data: null, error: { message: "Código de escola inválido." } };
  }

  if (escola.status_assinatura !== "ativa") {
    return {
      data: null,
      error: { message: "A assinatura desta escola está inativa. Contate a administração do Letrando." },
    };
  }

  // 2. Criar o usuário no Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, perfil: "professor", codigo_escola: codigoEscola } },
  });

  if (error) return { data, error };

  // 3. Gravar na tabela `professor` usando UPSERT (mesmo raciocínio do aluno)
  const { error: erroInsert } = await supabase.from("professor").upsert(
    {
      id: data.user.id,
      nome,
      email,
      escola_id: escola.id,
    },
    { onConflict: "id" }
  );

  if (erroInsert) {
    return { data: null, error: erroInsert };
  }

  return { data, error: null, escolaNome: escola.nome };
}

export async function login({ email, senha }) {
  // RF03 - Login com diferenciação de perfil
  if (modoDemo) return respostaDemo(email.split("@")[0], "aluno");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  return { data, error };
}
