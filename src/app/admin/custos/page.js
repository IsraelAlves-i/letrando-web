"use client";

import { useCallback, useEffect, useState } from "react";
import SidebarAdmin from "../_components/SidebarAdmin";
import ModalRegistroCusto from "./_components/ModalRegistroCusto";
import { listarEscolas } from "@/lib/escolas";
import { listarRegistrosCusto, criarRegistroCusto } from "@/lib/custos";

const NOMES_MES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default function MonitoramentoCustosPage() {
  const [escolas, setEscolas] = useState([]);
  const [escolaId, setEscolaId] = useState("");
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    listarEscolas()
      .then((data) => {
        setEscolas(data);
        if (data.length > 0) setEscolaId(data[0].id);
        else setCarregando(false);
      })
      .catch((err) => {
        console.error(err);
        setErro("Não foi possível carregar as escolas.");
        setCarregando(false);
      });
  }, []);

  const carregarRegistros = useCallback(async (id) => {
    if (!id) return;
    setCarregando(true);
    try {
      const data = await listarRegistrosCusto(id, 6);
      setRegistros(data);
    } catch (err) {
      console.error("Erro ao carregar custos:", err);
      setErro("Não foi possível carregar os registros de custo.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (escolaId) carregarRegistros(escolaId);
  }, [escolaId, carregarRegistros]);

  const escolaAtual = escolas.find((e) => e.id === escolaId);
  const registroAtual = registros[registros.length - 1];
  const custoPorAluno = registroAtual ? Number(registroAtual.custo_por_aluno) : 0;
  const limiarAtual = registroAtual ? Number(registroAtual.limiar_alerta) : 0.5;
  const emAlerta = registroAtual && custoPorAluno > limiarAtual;
  const maxValor = Math.max(1, ...registros.map((r) => Number(r.custo_por_aluno)));

  async function handleSalvar(campos) {
    await criarRegistroCusto(campos);
    await carregarRegistros(escolaId);
  }

  return (
    <main className="flex min-h-screen bg-letra-bg">
      <SidebarAdmin />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-letra-border bg-white px-6 py-3.5">
          <div>
            <h1 className="font-display text-lg font-extrabold text-letra-ink">Monitoramento de Custos</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-letra-ink2">Infraestrutura Supabase + Vercel ·</p>
              <select value={escolaId} onChange={(e) => setEscolaId(e.target.value)}
                className="rounded border border-letra-border px-1 text-xs">
                {escolas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={() => setModalAberto(true)} disabled={!escolaId}
            className="btn-primary !bg-letra-lilac !px-5 !py-2.5 text-sm hover:!bg-[#6B2FD6] disabled:opacity-50">
            + Registrar mês
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {erro && <p className="mb-4 text-sm font-semibold text-letra-rose">{erro}</p>}

          {escolas.length === 0 && !carregando ? (
            <p className="text-sm text-letra-ink2">Cadastre uma escola primeiro em &quot;Escolas&quot;.</p>
          ) : (
            <>
              {emAlerta && (
                <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-letra-rose bg-letra-roseSoft px-4 py-3">
                  <span className="text-xl">⚠️</span>
                  <p className="flex-1 text-sm text-[#7F1D1D]">
                    <strong>Alerta de custo:</strong> o custo por aluno em {NOMES_MES[registroAtual.mes - 1]} (R$ {custoPorAluno.toFixed(2)}) ultrapassou o limiar definido de R$ {limiarAtual.toFixed(2)}.
                  </p>
                </div>
              )}

              <section className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div className="card p-4">
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-letra-lilacSoft text-lg">💰</span>
                  <p className="font-display text-xl font-extrabold text-letra-lilac">
                    R$ {registroAtual ? Number(registroAtual.custo_total).toFixed(2) : "0.00"}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">
                    Custo total {registroAtual ? `${NOMES_MES[registroAtual.mes - 1]}/${registroAtual.ano}` : "—"}
                  </p>
                </div>
                <div className="card p-4">
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-letra-indigoSoft text-lg">🎓</span>
                  <p className="font-display text-xl font-extrabold text-letra-indigo">
                    {registroAtual ? registroAtual.total_alunos_ativos.toLocaleString("pt-BR") : 0}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Alunos ativos</p>
                </div>
                <div className="card p-4">
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-letra-mintSoft text-lg">📉</span>
                  <p className={`font-display text-xl font-extrabold ${emAlerta ? "text-letra-rose" : "text-letra-mint"}`}>
                    R$ {custoPorAluno.toFixed(2)}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Custo por aluno/mês</p>
                </div>
              </section>

              <div className="card p-5">
                <h3 className="mb-4 text-sm font-extrabold text-letra-ink">Evolução do custo por aluno — últimos 6 meses</h3>
                {registros.length === 0 ? (
                  <p className="text-xs text-letra-ink3">Nenhum registro ainda para {escolaAtual?.nome}.</p>
                ) : (
                  <>
                    <div className="flex items-end gap-2.5 border-b-2 border-l-2 border-letra-border px-2 pb-0" style={{ height: 150 }}>
                      {registros.map((r, i) => {
                        const valor = Number(r.custo_por_aluno);
                        const alerta = valor > Number(r.limiar_alerta);
                        const atual = i === registros.length - 1;
                        const alturaBarra = Math.round((valor / maxValor) * 108) + 6;
                        return (
                          <div key={`${r.ano}-${r.mes}`} className="flex flex-1 flex-col items-center justify-end gap-1">
                            <span className={`text-[10px] font-bold ${alerta ? "text-letra-rose" : atual ? "text-letra-lilac" : "text-letra-ink2"}`}>
                              R${valor.toFixed(2)} {alerta && "⚠️"}
                            </span>
                            <div
                              className={`w-full rounded-t ${
                                alerta ? "border-2 border-letra-rose bg-letra-roseSoft" : atual ? "bg-letra-lilacSoft" : "bg-letra-indigoSoft"
                              }`}
                              style={{ height: `${alturaBarra}px` }}
                            />
                            <span className={`text-[10px] ${atual ? "font-bold text-letra-lilac" : "text-letra-ink3"}`}>
                              {NOMES_MES[r.mes - 1]} {atual && "●"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2.5 flex items-center gap-2 text-[11px] text-letra-ink2">
                      <span className="inline-block h-0.5 w-2.5 bg-letra-rose" /> Limiar de alerta: R$ {limiarAtual.toFixed(2)}/aluno
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ModalRegistroCusto
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSalvar={handleSalvar}
        escolaId={escolaId}
        escolaNome={escolaAtual?.nome}
        alunosAtivosSugestao={escolaAtual?.totalAlunos ?? 0}
      />
    </main>
  );
}