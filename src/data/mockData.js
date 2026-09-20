// Dados de exemplo para as telas iniciais.
// ⚠️ Os exports abaixo (modulos, alunoInfo, ranking, alunosTurma, questaoExemplo)
// NÃO são mais usados pelas páginas de aluno/professor — elas já buscam dados
// reais do Supabase (ver src/app/aluno e src/app/professor). Ficam aqui só
// como referência histórica do protótipo inicial.

export const modulos = [
  { id: 1, sigla: "OSS", nome: "Osso, oço, oco", nivel: "Fundamental I", status: "concluido" },
  { id: 2, sigla: "?", nome: "Os quatro porquês", nivel: "Fundamental II", status: "em_andamento" },
  { id: 3, sigla: "S/Z", nome: "Som de S com Z", nivel: "Fundamental II", status: "bloqueado" },
  { id: 4, sigla: "X", nome: "X com som de CH", nivel: "Fundamental II", status: "bloqueado" },
  { id: 5, sigla: "Ç", nome: "Palavras com Ç e SC", nivel: "Fundamental II", status: "bloqueado" },
  { id: 6, sigla: "GR", nome: "Vocabulário frequente", nivel: "Ensino Médio", status: "bloqueado" },
  { id: 7, sigla: "RE", nome: "Regência e concordância", nivel: "Ensino Médio", status: "bloqueado" },
];

// Dados extras do aluno logado, usados no cabeçalho do mapa
// (streak e vidas ainda não têm tabela própria — ver RF09/RF11 no Confluence).
export const alunoInfo = {
  streak: 7,
  vidas: 5,
};

export const ranking = [
  { posicao: 1, nome: "Beatriz Souza", xp: 1280 },
  { posicao: 2, nome: "Lucas Andrade", xp: 1140 },
  { posicao: 3, nome: "Você", xp: 980, destaque: true },
  { posicao: 4, nome: "Rafael Lima", xp: 860 },
  { posicao: 5, nome: "Sofia Martins", xp: 790 },
];

export const alunosTurma = [
  { nome: "Beatriz Souza", moduloAtual: "Os quatro porquês", acertos: 92, status: "em_dia" },
  { nome: "Lucas Andrade", moduloAtual: "Osso, oço, oco", acertos: 78, status: "em_progresso" },
  { nome: "Rafael Lima", moduloAtual: "Os quatro porquês", acertos: 65, status: "em_progresso" },
  { nome: "Sofia Martins", moduloAtual: "Osso, oço, oco", acertos: 88, status: "em_dia" },
  { nome: "Pedro Torres", moduloAtual: "—", acertos: 0, status: "inativo" },
];

export const questaoExemplo = {
  moduloSigla: "?",
  categoria: "Porquês",
  numero: 3,
  total: 8,
  titulo: 'Qual "porquê" preenche corretamente a frase abaixo?',
  enunciado: "Ninguém sabe ___ ele faltou à aula hoje.",
  alternativas: ["Porque", "Por que", "Por quê", "Porquê"],
  correta: 1,
  explicacao:
    '"Por que" (separado, sem acento) é usado em perguntas diretas ou indiretas. Aqui a frase pergunta indiretamente o motivo da falta.',
};

// ============================================================
// DADOS DO PAINEL ADMIN (protótipo visual)
// As tabelas `plano_assinatura` e `registro_custo` não têm política
// de RLS liberada para o cliente (anon/authenticated) de propósito —
// só o backend com a service_role key pode gerenciar cobrança e
// custos. Por isso o painel Admin usa dados de exemplo aqui, em vez
// de consultar o Supabase diretamente do navegador. Para produção,
// isso precisa de uma rota de API (Next.js Route Handler) que usa a
// service_role key no servidor, nunca no cliente.
// ============================================================

export const escolasAdmin = [
  { nome: "E.E. Monteiro Lobato", local: "Curitiba — PR", plano: "Pro", professores: "8 / 10", alunos: 320, codigo: "ESC-2026-ALFA", vencimento: "31/12/2026", status: "ativa" },
  { nome: "Colégio São José", local: "São Paulo — SP", plano: "Básico", professores: "4 / 5", alunos: 180, codigo: "ESC-2026-BETA", vencimento: "15/09/2026", status: "vencendo" },
  { nome: "E.M. Anísio Teixeira", local: "Belo Horizonte — MG", plano: "Pro", professores: "12 / 15", alunos: 540, codigo: "ESC-2026-GAMA", vencimento: "28/02/2027", status: "ativa" },
  { nome: "Escola Castelo Branco", local: "Porto Alegre — RS", plano: "Básico", professores: "3 / 5", alunos: 95, codigo: "ESC-2025-DELTA", vencimento: "01/07/2026", status: "suspensa" },
];

export const custosMensais = [
  { mes: "Mar", valor: 0.42 },
  { mes: "Abr", valor: 0.39 },
  { mes: "Mai", valor: 0.44 },
  { mes: "Jun", valor: 0.47 },
  { mes: "Jul", valor: 0.58, alerta: true },
  { mes: "Ago", valor: 0.58, atual: true },
];

export const custosResumo = {
  custoTotal: 720,
  alunosAtivos: 1240,
  custoPorAluno: 0.58,
  limiarAlerta: 0.5,
};

// ============================================================
// DADOS DO MÓDULO FINANCEIRO (protótipo visual)
// Entradas e Saídas — visão consolidada de caixa. Assim como
// Escolas e Custos, é protótipo (mockData), sem backend real de
// cobrança/pagamento ainda — proposta aprovada com a professora
// para ser entregue neste nível de profundidade.
// ============================================================

export const financeiroResumo = {
  entradasTotal: 4280,
  saidasTotal: 1860,
  saldoLiquido: 2420,
  variacaoEntradas: 12, // % vs mês anterior
  variacaoSaidas: -4,
};

export const entradasDetalhadas = [
  { origem: "Mensalidades — Plano Pro", valor: 2998.5, qtd: 15, icone: "🏫" },
  { origem: "Mensalidades — Plano Básico", valor: 899.1, qtd: 9, icone: "🏫" },
  { origem: "Taxa de implantação (2 escolas novas)", valor: 300.0, qtd: 2, icone: "🆕" },
  { origem: "Upgrade de plano (Básico → Pro)", valor: 82.4, qtd: 1, icone: "⬆️" },
];

export const saidasDetalhadas = [
  { categoria: "Infraestrutura (Supabase + Vercel)", valor: 720.0, icone: "🖥️" },
  { categoria: "Taxa de gateway de pagamento (3,5%)", valor: 149.8, icone: "💳" },
  { categoria: "Marketing e aquisição de clientes", valor: 650.0, icone: "📣" },
  { categoria: "Suporte ao cliente (ferramentas)", valor: 340.2, icone: "🎧" },
];

export const fluxoCaixaMensal = [
  { mes: "Mar", entradas: 3120, saidas: 1510 },
  { mes: "Abr", entradas: 3340, saidas: 1580 },
  { mes: "Mai", entradas: 3610, saidas: 1690 },
  { mes: "Jun", entradas: 3850, saidas: 1740 },
  { mes: "Jul", entradas: 3980, saidas: 1940, alerta: true },
  { mes: "Ago", entradas: 4280, saidas: 1860, atual: true },
];


