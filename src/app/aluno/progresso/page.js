"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const coresAvatar = ["#FFB300", "#94A3B8", "#3D5AFE", "#00C48C", "#FF4757", "#7C3AED"];
const medalha = ["🥇", "🥈", "🥉"];

export default function ProgressoPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [aluno, setAluno] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [kpis, setKpis] = useState({ modulosConcluidos: 0, totalModulos: 0, taxaAcerto: 0 });

  useEffect(() => {
    async function carregar() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/login?perfil=aluno");
        return;
      }

      const { data: alunoData } = await supabase
        .from("aluno")
        .select("id, nome, pontuacao_total, dias_consecutivos, turma_id, turma:turma_id(nome, serie)")
        .eq("id", user.id)
        .single();

      if (!alunoData) {
        router.replace("/login?perfil=aluno");
        return;
      }
      setAluno(alunoData);

      // Progresso do aluno — para calcular módulos concluídos e taxa de acerto média
      const { data: progresso } = await supabase
        .from("progresso")
        .select("status, pontuacao_obtida")
        .eq("aluno_id", user.id);

      const { count: totalModulos } = await supabase
        .from("modulo")
        .select("id", { count: "exact", head: true });

      const concluidos = (progresso ?? []).filter((p) => p.status === "concluido");
      const media = concluidos.length
        ? Math.round(concluidos.reduce((acc, p) => acc + p.pontuacao_obtida, 0) / concluidos.length)
        : 0;

      setKpis({
        modulosConcluidos: concluidos.length,
        totalModulos: totalModulos ?? 0,
        taxaAcerto: media,
      });

      // Ranking da turma
      if (alunoData.turma_id) {
        const { data: colegas } = await supabase
          .from("aluno")
          .select("id, nome, pontuacao_total")
          .eq("turma_id", alunoData.turma_id)
          .order("pontuacao_total", { ascending: false });
        setRanking(colegas ?? []);
      }

      setCarregando(false);
    }

    carregar();
  }, [router]);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-letra-bg">
        <p className="text-sm text-letra-ink2">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-letra-bg">
      <div className="bg-gradient-to-r from-letra-indigo to-letra-lilac px-8 py-6 text-white">
        <Link href="/aluno/mapa" className="mb-1.5 inline-block text-xs text-white/70 hover:text-white">
          ← Voltar ao mapa
        </Link>
        <h1 className="font-display text-xl font-extrabold">Meu Progresso</h1>
        <p className="text-sm text-white/75">
          {aluno.nome} · {aluno.turma?.nome ?? aluno.turma?.serie ?? "Sem turma"}
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-6">
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <div className="card p-4 text-center">
            <p className="mb-1.5 text-2xl">⭐</p>
            <p className="font-display text-2xl font-extrabold text-letra-lilac">{aluno.pontuacao_total}</p>
            <p className="mt-1 text-[11px] font-semibold text-letra-ink2">XP total</p>
          </div>
          <div className="card p-4 text-center">
            <p className="mb-1.5 text-2xl">📚</p>
            <p className="font-display text-2xl font-extrabold text-letra-ink">
              {kpis.modulosConcluidos}/{kpis.totalModulos}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Módulos concluídos</p>
          </div>
          <div className="card p-4 text-center">
            <p className="mb-1.5 text-2xl">🔥</p>
            <p className="font-display text-2xl font-extrabold text-letra-orange">{aluno.dias_consecutivos}</p>
            <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Dias seguidos</p>
          </div>
          <div className="card p-4 text-center">
            <p className="mb-1.5 text-2xl">🎯</p>
            <p className="font-display text-2xl font-extrabold text-letra-mint">{kpis.taxaAcerto}%</p>
            <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Taxa de acertos</p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-extrabold text-letra-ink">🏆 Ranking da Turma</h2>
          <div className="flex flex-col">
            {ranking.map((r, i) => {
              const voce = r.id === aluno.id;
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 py-2.5 ${
                    voce ? "-mx-3 rounded-lg bg-letra-indigoSoft px-3" : "border-b border-letra-border last:border-none"
                  }`}
                >
                  <span className="w-7 text-center text-base">
                    {medalha[i] ?? <span className="text-xs font-bold text-letra-ink2">{i + 1}</span>}
                  </span>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                    style={{ backgroundColor: coresAvatar[i % coresAvatar.length] }}
                  >
                    {r.nome.charAt(0)}
                  </span>
                  <span className={`flex-1 text-sm ${voce ? "font-extrabold text-letra-ink" : "font-semibold text-letra-ink"}`}>
                    {r.nome} {voce && "(você)"}
                  </span>
                  <span className={`text-sm font-extrabold ${voce ? "text-letra-indigo" : "text-letra-lilac"}`}>
                    {r.pontuacao_total} XP
                  </span>
                </div>
              );
            })}
            {ranking.length === 0 && (
              <p className="py-4 text-center text-sm text-letra-ink2">Sua turma ainda não tem outros alunos.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
