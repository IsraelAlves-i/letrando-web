"use client";

import { useCallback, useEffect, useState } from "react";
import SidebarAdmin from "../_components/SidebarAdmin";
import MesAnoFields, { periodoValido } from "../_components/MesAnoFields";
import { buscarDre } from "@/lib/contabilidade";
import { listarLancamentos, iconeDaCategoria } from "@/lib/financeiro";
import { gerarDrePdf } from "@/lib/gerarDrePdf";

const NOMES_MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatarReal(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function LinhaDre({ sinal, titulo, origem, valor, cor }) {
  return (
    <div className="flex items-center gap-4 border-b border-letra-border px-5 py-4 last:border-b-0">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold ${cor.fundo} ${cor.texto}`}>{sinal}</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-letra-ink">{titulo}</p>
        <p className="text-[11px] text-letra-ink2">{origem}</p>
      </div>
      <p className={`font-display text-lg font-extrabold ${cor.texto}`}>{formatarReal(valor)}</p>
    </div>
  );
}

export default function ContabilidadePage() {
  const hoje = new Date();
  // mes e ano podem ficar null enquanto a pessoa digita
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [dre, setDre] = useState(null);
  const [lancamentos, setLancamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    // Só busca quando mês (1–12) e ano (4 dígitos) estão completos
    if (!periodoValido(mes, ano)) return;
    setCarregando(true);
    setErro("");
    try {
      const [dreData, lancData] = await Promise.all([buscarDre(mes, ano), listarLancamentos({ mes, ano })]);
      setDre(dreData);
      setLancamentos(lancData);
    } catch (err) {
      console.error("Erro ao carregar contabilidade:", err);
      setErro("Não foi possível carregar a contabilidade.");
    } finally {
      setCarregando(false);
    }
  }, [mes, ano]);

  useEffect(() => { carregar(); }, [carregar]);

  const periodoOk = periodoValido(mes, ano);
  const rotuloPeriodo = periodoOk ? `${NOMES_MES[mes - 1]}/${ano}` : "—";

  const teveLucro = dre ? dre.resultado >= 0 : true;
  const totalEntradas = lancamentos.filter((l) => l.tipo === "entrada").reduce((acc, l) => acc + Number(l.valor), 0);
  const totalSaidas = lancamentos.filter((l) => l.tipo === "saida").reduce((acc, l) => acc + Number(l.valor), 0);

  return (
    <main className="flex min-h-screen bg-letra-bg">
      <SidebarAdmin />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-letra-border bg-white px-6 py-3.5">
          <div>
            <h1 className="font-display text-lg font-extrabold text-letra-ink">Contabilidade</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-letra-ink2">DRE simplificado · alimentado pelo Financeiro e pelo Fiscal ·</p>
              <MesAnoFields mes={mes} ano={ano} onMesChange={setMes} onAnoChange={setAno} />
            </div>
          </div>
          <button onClick={() => gerarDrePdf({ mes, ano, dre, lancamentos })} disabled={!dre || !periodoOk}
            className="btn-primary !bg-letra-lilac !px-4 !py-2 text-sm hover:!bg-[#6B2FD6] disabled:opacity-50">
            Baixar PDF
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {erro && <p className="mb-4 text-sm font-semibold text-letra-rose">{erro}</p>}

          {carregando || !dre ? (
            <p className="text-sm text-letra-ink2">Carregando...</p>
          ) : (
            <>
              {/* DRE */}
              <section className="card mb-5 overflow-hidden !p-0">
                <div className="border-b border-letra-border px-5 py-3.5">
                  <h3 className="text-sm font-extrabold text-letra-ink">DRE — {rotuloPeriodo}</h3>
                  <p className="text-[5px] text-letra-ink2">Demonstração do Resultado: Vendas − Impostos − Despesas = Lucro ou Prejuízo</p>
                </div>
                <LinhaDre sinal="+" titulo="Vendas" origem="Vem do Financeiro (entradas do mês)" valor={dre.vendas}
                  cor={{ fundo: "bg-letra-mintSoft", texto: "text-letra-mint" }} />
                <LinhaDre sinal="−" titulo="Impostos" origem="Vem do Fiscal (DAS apurado no mês)" valor={dre.impostos}
                  cor={{ fundo: "bg-letra-goldSoft", texto: "text-[#7A4F00]" }} />
                <LinhaDre sinal="−" titulo="Despesas" origem="Vem do Financeiro (saídas do mês: Supabase, Vercel...)" valor={dre.despesas}
                  cor={{ fundo: "bg-letra-roseSoft", texto: "text-letra-rose" }} />
                <div className={`flex items-center gap-4 px-5 py-5 ${teveLucro ? "bg-letra-mintSoft" : "bg-letra-roseSoft"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-extrabold ${teveLucro ? "text-letra-mint" : "text-letra-rose"}`}>=</span>
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-letra-ink">{teveLucro ? "Lucro" : "Prejuízo"}</p>
                    <p className="text-[11px] text-letra-ink2">Vendas − Impostos − Despesas</p>
                  </div>
                  <p className={`font-display text-lg font-extrabold ${teveLucro ? "text-letra-mint" : "text-letra-rose"}`}>{formatarReal(Math.abs(dre.resultado))}</p>
                </div>
              </section>

              {/* Relatório de entradas e saídas */}
              <section className="card overflow-hidden !p-0">
                <div className="border-b border-letra-border px-5 py-3.5">
                  <h3 className="text-sm font-extrabold text-letra-ink">Relatório de entradas e saídas — {rotuloPeriodo}</h3>
                </div>
                {lancamentos.length === 0 ? (
                  <p className="px-5 py-4 text-xs text-letra-ink3">Nenhum lançamento neste período.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wide text-letra-ink2">
                        <th className="px-5 py-2">Data</th>
                        <th className="px-5 py-2">Tipo</th>
                        <th className="px-5 py-2">Origem / categoria</th>
                        <th className="px-5 py-2">Descrição</th>
                        <th className="px-5 py-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-letra-border">
                      {lancamentos.map((l) => (
                        <tr key={l.id}>
                          <td className="px-5 py-3 text-letra-ink2">{formatarData(l.data_lancamento)}</td>
                          <td className="px-5 py-3">
                            <span className={`badge-pill ${l.tipo === "entrada" ? "bg-letra-mintSoft text-[#065F46]" : "bg-letra-roseSoft text-letra-rose"}`}>
                              {l.tipo === "entrada" ? "Entrada" : "Saída"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-letra-ink">
                            {iconeDaCategoria(l.categoria, l.tipo)} {l.tipo === "entrada" && l.municipio?.nome ? `${l.municipio.nome} · ` : ""}{l.categoria}
                          </td>
                          <td className="px-5 py-3 text-letra-ink2">{l.descricao || "—"}</td>
                          <td className={`px-5 py-3 text-right font-extrabold ${l.tipo === "entrada" ? "text-letra-mint" : "text-letra-rose"}`}>
                            {l.tipo === "entrada" ? "+" : "−"} {formatarReal(l.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-letra-border bg-[#F8FAFC]">
                        <td colSpan={4} className="px-5 py-3 text-xs font-bold text-letra-ink">Total de entradas</td>
                        <td className="px-5 py-3 text-right font-extrabold text-letra-mint">{formatarReal(totalEntradas)}</td>
                      </tr>
                      <tr className="bg-[#F8FAFC]">
                        <td colSpan={4} className="px-5 py-3 text-xs font-bold text-letra-ink">Total de saídas</td>
                        <td className="px-5 py-3 text-right font-extrabold text-letra-rose">{formatarReal(totalSaidas)}</td>
                      </tr>
                    </tfoot>
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