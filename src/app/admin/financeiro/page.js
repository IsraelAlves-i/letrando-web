"use client";

import { useEffect, useState, useCallback } from "react";
import SidebarAdmin from "../_components/SidebarAdmin";
import ModalLancamento from "./_components/ModalLancamento";
import {
  listarLancamentos,
  buscarResumoMensal,
  buscarFluxoCaixaMensal,
  iconeDaCategoria,
} from "@/lib/financeiro";

function formatarReal(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const NOMES_MES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export default function FinanceiroPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [resumo, setResumo] = useState({ entradas_total: 0, saidas_total: 0 });
  const [fluxo, setFluxo] = useState([]);
  const [lancamentos, setLancamentos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [resumoData, fluxoData, lancamentosData] = await Promise.all([
        buscarResumoMensal(mes, ano),
        buscarFluxoCaixaMensal(6),
        listarLancamentos({ mes, ano }),
      ]);
      setResumo(resumoData);
      setFluxo(fluxoData);
      setLancamentos(lancamentosData);
    } catch (err) {
      console.error("Erro ao carregar financeiro:", err);
      setErro("Não foi possível carregar os dados financeiros.");
    } finally {
      setCarregando(false);
    }
  }, [mes, ano]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const saldoLiquido = resumo.entradas_total - resumo.saidas_total;
  const entradas = lancamentos.filter((l) => l.tipo === "entrada");
  const saidas = lancamentos.filter((l) => l.tipo === "saida");
  const maxFluxo = Math.max(1, ...fluxo.map((f) => Math.max(f.entradas_total, f.saidas_total)));

  return (
    <main className="flex min-h-screen bg-letra-bg">
      <SidebarAdmin />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-letra-border bg-white px-6 py-3.5">
          <div>
            <h1 className="font-display text-lg font-extrabold text-letra-ink">Financeiro</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-letra-ink2">Visão consolidada da empresa ·</p>
              <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="rounded border border-letra-border px-1 text-xs">
                {NOMES_MES.map((nome, i) => (
                  <option key={nome} value={i + 1}>{nome}</option>
                ))}
              </select>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className="w-16 rounded border border-letra-border px-1 text-xs"
              />
            </div>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="btn-primary !bg-letra-lilac !px-5 !py-2.5 text-sm hover:!bg-[#6B2FD6]"
          >
            + Registrar lançamento
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {erro && <p className="mb-4 text-sm font-semibold text-letra-rose">{erro}</p>}

          {carregando ? (
            <p className="text-sm text-letra-ink2">Carregando...</p>
          ) : (
            <>
              {/* KPIs */}
              <section className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div className="card p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-letra-mintSoft text-lg">📈</div>
                  <p className="font-display text-xl font-extrabold text-letra-mint">{formatarReal(resumo.entradas_total)}</p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Entradas do mês</p>
                </div>
                <div className="card p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-letra-roseSoft text-lg">📉</div>
                  <p className="font-display text-xl font-extrabold text-letra-rose">{formatarReal(resumo.saidas_total)}</p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Saídas do mês</p>
                </div>
                <div className="card p-4">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-letra-lilacSoft text-lg">🏦</div>
                  <p className="font-display text-xl font-extrabold text-letra-lilac">{formatarReal(saldoLiquido)}</p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Saldo líquido do mês</p>
                </div>
              </section>

              {/* Fluxo de caixa */}
              <section className="card mb-5 p-5">
                <h3 className="mb-4 text-sm font-extrabold text-letra-ink">Fluxo de caixa — últimos 6 meses</h3>
                <div className="flex items-end gap-4 border-b-2 border-l-2 border-letra-border px-2 pb-0" style={{ height: 160 }}>
                  {fluxo.map((f) => {
                    const alturaEntradas = Math.round((f.entradas_total / maxFluxo) * 120) + 4;
                    const alturaSaidas = Math.round((f.saidas_total / maxFluxo) * 120) + 4;
                    return (
                      <div key={`${f.ano}-${f.mes}`} className="flex flex-1 flex-col items-center justify-end gap-1">
                        <div className="flex items-end gap-1">
                          <div className="w-5 rounded-t bg-letra-mint" style={{ height: `${alturaEntradas}px` }} />
                          <div className="w-5 rounded-t bg-letra-rose" style={{ height: `${alturaSaidas}px` }} />
                        </div>
                        <span className="mt-1 text-[10px] text-letra-ink3">{NOMES_MES[f.mes - 1]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-4 text-[11px] text-letra-ink2">
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-letra-mint" />Entradas</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-letra-rose" />Saídas</span>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Entradas: por município */}
                <section className="card overflow-hidden !p-0">
                  <div className="border-b border-letra-border px-5 py-3.5">
                    <h3 className="text-sm font-extrabold text-letra-ink">💰 Entradas</h3>
                  </div>
                  {entradas.length === 0 ? (
                    <p className="px-5 py-4 text-xs text-letra-ink3">Nenhuma entrada neste período.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wide text-letra-ink2">
                          <th className="px-5 py-2">Município</th>
                          <th className="px-5 py-2">Nº escolas</th>
                          <th className="px-5 py-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-letra-border">
                        {entradas.map((e) => (
                          <tr key={e.id}>
                            <td className="px-5 py-3">
                              <p className="font-semibold text-letra-ink">
                                {iconeDaCategoria(e.categoria, "entrada")} {e.municipio?.nome ?? "—"}
                                {e.municipio?.uf ? ` (${e.municipio.uf})` : ""}
                              </p>
                              <p className="text-xs text-letra-ink2">{e.categoria}{e.descricao ? ` · ${e.descricao}` : ""}</p>
                            </td>
                            <td className="px-5 py-3 text-letra-ink2">{e.municipio?.qtdEscolas ?? "—"}</td>
                            <td className="px-5 py-3 text-right font-extrabold text-letra-mint">{formatarReal(e.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>

                {/* Saídas: por serviço/categoria */}
                <section className="card overflow-hidden !p-0">
                  <div className="border-b border-letra-border px-5 py-3.5">
                    <h3 className="text-sm font-extrabold text-letra-ink">💸 Saídas</h3>
                  </div>
                  <div className="divide-y divide-letra-border">
                    {saidas.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                        <span className="text-lg">{iconeDaCategoria(s.categoria, "saida")}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-letra-ink">{s.categoria}</p>
                          <p className="text-xs text-letra-ink2">{s.descricao || "—"}</p>
                        </div>
                        <span className="text-sm font-extrabold text-letra-rose">{formatarReal(s.valor)}</span>
                      </div>
                    ))}
                    {saidas.length === 0 && (
                      <p className="px-5 py-4 text-xs text-letra-ink3">Nenhuma saída neste período.</p>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>

      <ModalLancamento
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSucesso={carregarDados}
      />
    </main>
  );
}