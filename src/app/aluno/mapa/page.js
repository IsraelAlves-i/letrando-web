"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const corTile = {
  concluido: "bg-letra-mint shadow-[0_4px_0_rgba(0,150,90,0.3)]",
  em_andamento: "bg-letra-indigo shadow-[0_6px_20px_rgba(61,90,254,0.45)] animate-pulseSoft",
  bloqueado: "bg-letra-ink3/60 shadow-none",
};

const tierInfo = {
  "Fundamental I": { icone: "🌱", cor: "text-[#00875A] border-[#00875A]" },
  "Fundamental II": { icone: "📖", cor: "text-letra-indigo border-letra-indigo" },
  "Ensino Médio": { icone: "🎓", cor: "text-letra-lilac border-letra-lilac" },
  Avançado: { icone: "🏆", cor: "text-letra-rose border-letra-rose" },
};

export default function MapaModulosPage() {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [alunoAtual, setAlunoAtual] = useState(null);
  const [niveisComModulos, setNiveisComModulos] = useState([]);
  const [posicaoRanking, setPosicaoRanking] = useState(null);
  const [vidas] = useState(5);

  useEffect(() => {
    async function carregarDados() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/login?perfil=aluno");
        return;
      }

      const { data: aluno, error: erroAluno } = await supabase
        .from("aluno")
        .select("id, nome, pontuacao_total, dias_consecutivos, turma_id, turma:turma_id ( nome, serie )")
        .eq("id", user.id)
        .single();

      if (erroAluno || !aluno) {
        router.replace("/login?perfil=aluno");
        return;
      }
      setAlunoAtual(aluno);

      const { data: niveis } = await supabase.from("nivel").select("id, nome, ordem").order("ordem");
      const { data: modulosData } = await supabase
        .from("modulo")
        .select("id, nome, tipo, icone, nivel_id")
        .order("created_at");

      // Lições de todos os módulos (pra saber quantas cada um tem)
      const { data: licoesData } = await supabase
        .from("licao")
        .select("id, modulo_id, ordem")
        .order("ordem");

      // Progresso do aluno em cada lição
      const { data: progresso } = await supabase
        .from("progresso")
        .select("licao_id, status")
        .eq("aluno_id", user.id);

      const statusPorLicao = new Map((progresso ?? []).map((p) => [p.licao_id, p.status]));
      const licoesPorModulo = new Map();
      (licoesData ?? []).forEach((l) => {
        if (!licoesPorModulo.has(l.modulo_id)) licoesPorModulo.set(l.modulo_id, []);
        licoesPorModulo.get(l.modulo_id).push(l);
      });

      // Calcula o status de cada módulo a partir das lições concluídas
      let desbloqueado = true;
      const modulosComStatus = (modulosData ?? []).map((m) => {
        const licoes = licoesPorModulo.get(m.id) ?? [];
        const totalLicoes = licoes.length;
        const concluidas = licoes.filter((l) => statusPorLicao.get(l.id) === "concluido").length;
        const temAlgumaEmCurso = licoes.some((l) => statusPorLicao.has(l.id));

        let status;
        if (totalLicoes > 0 && concluidas === totalLicoes) {
          status = "concluido";
        } else if (temAlgumaEmCurso) {
          status = "em_andamento";
          desbloqueado = false;
        } else if (desbloqueado) {
          status = "em_andamento";
          desbloqueado = false;
        } else {
          status = "bloqueado";
        }

        return {
          ...m,
          status,
          totalLicoes,
          concluidas,
          sigla: (m.icone || m.nome[0]).slice(0, 3),
        };
      });

      const agrupado = (niveis ?? [])
        .map((n) => ({
          nivel: n.nome,
          modulos: modulosComStatus.filter((m) => m.nivel_id === n.id),
        }))
        .filter((g) => g.modulos.length > 0);

      setNiveisComModulos(agrupado);

      if (aluno.turma_id) {
        const { data: colegas } = await supabase
          .from("aluno")
          .select("id, pontuacao_total")
          .eq("turma_id", aluno.turma_id)
          .order("pontuacao_total", { ascending: false });

        const idx = (colegas ?? []).findIndex((c) => c.id === user.id);
        setPosicaoRanking(idx >= 0 ? idx + 1 : null);
      }

      setCarregando(false);
    }

    carregarDados();
  }, [router]);

  async function sair() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-letra-bg">
        <p className="text-sm text-letra-ink2">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-letra-bg">
      <header className="flex h-14 items-center gap-4 border-b border-letra-border bg-white px-7">
        <div className="flex items-center gap-2 font-display text-lg font-extrabold text-letra-indigo">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-letra-indigo text-sm text-white">
            📘
          </span>
          Letrando
        </div>

        {alunoAtual && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-letra-ink">{alunoAtual.nome}</span>
            <span className="text-xs text-letra-ink2">
              {alunoAtual.turma?.nome ?? alunoAtual.turma?.serie ?? "Sem turma"}
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-5 text-sm">
          <Link href="/aluno/progresso" className="font-bold text-letra-lilac hover:underline">
            ⭐ {alunoAtual?.pontuacao_total ?? 0} XP
          </Link>
          <span className="font-bold text-letra-orange">🔥 {alunoAtual?.dias_consecutivos ?? 0} dias</span>
          <span>{"❤️".repeat(vidas)}</span>
          <Link href="/aluno/progresso" className="badge-pill bg-letra-indigoSoft text-letra-indigo hover:opacity-80">
            🏅 {posicaoRanking ?? "-"}º lugar na turma
          </Link>
          <button onClick={sair} className="text-xs text-letra-ink2 hover:text-letra-ink">
            Sair
          </button>
        </div>
      </header>

      <div className="flex flex-col items-center px-6 py-8">
        {niveisComModulos.map((grupo, ni) => {
          const info = tierInfo[grupo.nivel] ?? tierInfo["Fundamental II"];

          return (
            <div key={grupo.nivel} className="flex flex-col items-center">
              {ni > 0 && <div className="my-1 h-6 w-0.5 border-l-2 border-dashed border-letra-border" />}
              <div className={`mb-4 rounded-full border-[1.5px] px-4 py-1 text-xs font-bold uppercase tracking-wide ${info.cor}`}>
                {info.icone} {grupo.nivel}
              </div>

              {grupo.modulos.map((m, i) => {
                const clicavel = m.status !== "bloqueado";
                const subtitulo =
                  m.status === "concluido"
                    ? `✓ ${m.concluidas}/${m.totalLicoes} lições`
                    : m.status === "em_andamento"
                    ? `▶ Lição ${m.concluidas + 1} de ${m.totalLicoes}`
                    : "🔒 Bloqueado";

                const conteudo = (
                  <div className="flex flex-col items-center">
                    <div className={`tile relative h-[74px] w-[74px] ${corTile[m.status]}`}>
                      <span className="font-display text-xl font-extrabold text-white/95">
                        {m.status === "bloqueado" ? "🔒" : m.sigla}
                      </span>
                      {m.status === "concluido" && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs shadow">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-2 max-w-[100px] text-center text-xs font-bold text-letra-ink">{m.nome}</p>
                    <p
                      className={`mt-0.5 text-center text-[11px] ${
                        m.status === "concluido"
                          ? "font-semibold text-letra-mint"
                          : m.status === "em_andamento"
                          ? "font-semibold text-letra-indigo"
                          : "text-letra-ink2"
                      }`}
                    >
                      {subtitulo}
                    </p>
                  </div>
                );

                return (
                  <div key={m.id} className="flex flex-col items-center">
                    {i > 0 && <div className="my-1 h-6 w-0.5 border-l-2 border-dashed border-letra-border" />}
                    {clicavel ? (
                      <Link href={`/aluno/modulo/${m.id}`}>{conteudo}</Link>
                    ) : (
                      <div className="cursor-not-allowed opacity-60">{conteudo}</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </main>
  );
}
