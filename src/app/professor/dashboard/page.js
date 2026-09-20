"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "../_components/Sidebar";

const corStatus = {
  em_dia: "bg-letra-mintSoft text-[#065F46]",
  em_progresso: "bg-letra-indigoSoft text-letra-indigo",
  inativo: "bg-letra-roseSoft text-letra-rose",
};
const rotuloStatus = { em_dia: "Em dia ✓", em_progresso: "Em progresso", inativo: "Inativo !" };
const coresAvatar = ["#FFB300", "#94A3B8", "#3D5AFE", "#00C48C", "#FF4757", "#7C3AED"];

function calcularStatus(aluno) {
  const temEmAndamento = aluno.progresso?.some((p) => p.status === "em_andamento");
  if (temEmAndamento) return "em_progresso";
  if (!aluno.ultimo_acesso) return "inativo";
  const dias = (Date.now() - new Date(aluno.ultimo_acesso).getTime()) / (1000 * 60 * 60 * 24);
  return dias > 7 ? "inativo" : "em_dia";
}

function moduloEAcertoMaisRecente(aluno) {
  const lista = aluno.progresso ?? [];
  if (lista.length === 0) return { modulo: "—", acertos: 0 };
  const maisRecente = [...lista].sort((a, b) => new Date(b.data_conclusao ?? 0) - new Date(a.data_conclusao ?? 0))[0];
  const nomeModulo = maisRecente.licao?.modulo?.nome ?? "—";
  const nomeLicao = maisRecente.licao?.nome ?? "";
  return { modulo: nomeLicao ? `${nomeModulo} · ${nomeLicao}` : nomeModulo, acertos: maisRecente.pontuacao_obtida ?? 0 };
}

export default function DashboardProfessorPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [professor, setProfessor] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/login?perfil=professor");
        return;
      }

      const { data: prof } = await supabase.from("professor").select("nome").eq("id", user.id).single();
      if (!prof) {
        router.replace("/login?perfil=professor");
        return;
      }
      setProfessor(prof);

      const { data: turmasData } = await supabase
        .from("turma")
        .select("id, nome, serie, codigo_acesso")
        .eq("professor_id", user.id)
        .order("created_at");

      setTurmas(turmasData ?? []);
      if (turmasData && turmasData.length > 0) {
        setTurmaSelecionada(turmasData[0]);
      } else {
        setCarregando(false);
      }
    }
    carregar();
  }, [router]);

  useEffect(() => {
    async function carregarAlunos() {
      if (!turmaSelecionada) return;
      setCarregando(true);
      const { data } = await supabase
        .from("aluno")
        .select("id, nome, ultimo_acesso, progresso(status, pontuacao_obtida, data_conclusao, licao:licao_id(nome, modulo:modulo_id(nome)))")
        .eq("turma_id", turmaSelecionada.id);
      setAlunos(data ?? []);
      setCarregando(false);
    }
    carregarAlunos();
  }, [turmaSelecionada]);

  const linhas = alunos.map((a) => ({
    ...a,
    status: calcularStatus(a),
    ...moduloEAcertoMaisRecente(a),
  }));

  const media = linhas.length ? Math.round(linhas.reduce((acc, a) => acc + a.acertos, 0) / linhas.length) : 0;
  const kpis = [
    { icone: "👥", cor: "bg-letra-indigoSoft", label: "Alunos na turma", valor: linhas.length, valorCor: "text-letra-ink" },
    { icone: "✅", cor: "bg-letra-mintSoft", label: "Média de acerto", valor: `${media}%`, valorCor: "text-letra-mint" },
    { icone: "⭐", cor: "bg-letra-goldSoft", label: "Em dia", valor: linhas.filter((a) => a.status === "em_dia").length, valorCor: "text-letra-lilac" },
    { icone: "⚠️", cor: "bg-letra-roseSoft", label: "Inativos", valor: linhas.filter((a) => a.status === "inativo").length, valorCor: "text-letra-rose" },
  ];

  return (
    <main className="flex min-h-screen bg-letra-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-letra-border bg-white px-6 py-3.5">
          <div>
            <h1 className="font-display text-lg font-extrabold text-letra-ink">
              Bom dia, {professor?.nome?.split(" ")[0] ?? "Prof."}! 👋
            </h1>
            <p className="text-xs text-letra-ink2">{turmaSelecionada?.nome ?? "Nenhuma turma selecionada"}</p>
          </div>
          {turmas.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setMenuAberto((v) => !v)}
                className="badge-pill bg-letra-indigoSoft text-letra-indigo"
              >
                {turmaSelecionada?.nome ?? "Selecionar turma"} ▾
              </button>
              {menuAberto && (
                <div className="absolute right-0 z-10 mt-1.5 w-56 rounded-lg border border-letra-border bg-white py-1.5 shadow-cardHover">
                  {turmas.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTurmaSelecionada(t);
                        setMenuAberto(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-letra-ink hover:bg-letra-bg"
                    >
                      {t.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {turmas.length === 0 && !carregando ? (
            <div className="card p-8 text-center">
              <p className="mb-3 text-sm text-letra-ink2">Você ainda não tem nenhuma turma criada.</p>
              <a href="/professor/turmas" className="btn-primary inline-block">
                + Criar minha primeira turma
              </a>
            </div>
          ) : (
            <>
              <section className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                {kpis.map((kpi) => (
                  <div key={kpi.label} className="card flex items-center gap-3 p-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${kpi.cor}`}>
                      {kpi.icone}
                    </span>
                    <div>
                      <p className={`font-display text-xl font-extrabold leading-none ${kpi.valorCor}`}>{kpi.valor}</p>
                      <p className="mt-1 text-[11px] font-semibold text-letra-ink2">{kpi.label}</p>
                    </div>
                  </div>
                ))}
              </section>

              <section className="card overflow-hidden !p-0">
                <div className="border-b border-letra-border px-5 py-3.5">
                  <h3 className="text-sm font-extrabold text-letra-ink">
                    Desempenho por Aluno — {turmaSelecionada?.nome}
                  </h3>
                </div>
                {carregando ? (
                  <p className="p-6 text-center text-sm text-letra-ink2">Carregando alunos...</p>
                ) : linhas.length === 0 ? (
                  <p className="p-6 text-center text-sm text-letra-ink2">
                    Nenhum aluno cadastrado nesta turma ainda. Compartilhe o código{" "}
                    <strong className="font-mono">{turmaSelecionada?.codigo_acesso}</strong> com seus alunos.
                  </p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wide text-letra-ink2">
                        <th className="px-5 py-2.5">Aluno</th>
                        <th className="px-5 py-2.5">Módulo atual</th>
                        <th className="px-5 py-2.5">Acertos</th>
                        <th className="px-5 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linhas.map((a, i) => (
                        <tr key={a.id} className="border-t border-letra-border hover:bg-[#FAFBFF]">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5 font-semibold text-letra-ink">
                              <span
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                                style={{ backgroundColor: coresAvatar[i % coresAvatar.length] }}
                              >
                                {a.nome.charAt(0)}
                              </span>
                              {a.nome}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-letra-ink2">{a.modulo}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-letra-border">
                                <div
                                  className={`h-full rounded-full ${
                                    a.acertos >= 80 ? "bg-letra-mint" : a.acertos >= 50 ? "bg-letra-gold" : "bg-letra-rose"
                                  }`}
                                  style={{ width: `${a.acertos}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-letra-ink">{a.acertos}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`badge-pill ${corStatus[a.status]}`}>{rotuloStatus[a.status]}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
