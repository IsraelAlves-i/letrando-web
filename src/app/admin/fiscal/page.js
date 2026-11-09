"use client";

import { useCallback, useEffect, useState } from "react";
import SidebarAdmin from "../_components/SidebarAdmin";
import MesAnoFields, { periodoValido } from "../_components/MesAnoFields";
import ModalRegistrarPagamento from "./_components/ModalRegistrarPagamento";
import ModalNotaFiscal from "./_components/ModalNotaFiscal";
import ModalCancelarNota from "./_components/ModalCancelarNota";
import ModalApuracao from "./_components/ModalApuracao";
import { listarMunicipiosComAssinatura } from "@/lib/escolas";
import { gerarNotaFiscalPdf } from "@/lib/gerarNotaPdf";
import {
  listarPagamentosComNotas, emitirNota, confirmarEmissao, cancelarNota, reemitirNota,
  listarApuracoes, criarApuracao, marcarApuracaoComoPaga,
} from "@/lib/fiscal";

const NOMES_MES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const corStatusNota = {
  pendente: "bg-letra-goldSoft text-[#7A4F00]",
  emitida: "bg-letra-mintSoft text-[#065F46]",
};

// "Nome — UF", o mesmo texto que aparecia na lista
const rotuloMunicipio = (m) => `${m.nome}${m.uf ? ` — ${m.uf}` : ""}`;

// minúsculas e sem acento, para comparar o que a pessoa digitou
const normalizar = (s) =>
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function FiscalPage() {
  const [aba, setAba] = useState("notas");

  const hoje = new Date();
  // mes e ano podem ficar null enquanto a pessoa digita
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());

  const [municipios, setMunicipios] = useState([]);
  const [municipioId, setMunicipioId] = useState("");
  const [municipioBusca, setMunicipioBusca] = useState("");
  const [pagamentos, setPagamentos] = useState([]);
  const [carregandoNotas, setCarregandoNotas] = useState(true);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [modalNota, setModalNota] = useState(null);
  const [modalCancelar, setModalCancelar] = useState(null);

  const [apuracoes, setApuracoes] = useState([]);
  const [carregandoApuracoes, setCarregandoApuracoes] = useState(true);
  const [modalApuracaoAberto, setModalApuracaoAberto] = useState(false);

  const [erro, setErro] = useState("");

  useEffect(() => {
    listarMunicipiosComAssinatura()
      .then((data) => {
        setMunicipios(data);
        if (data.length > 0) {
          setMunicipioId(data[0].id);
          setMunicipioBusca(rotuloMunicipio(data[0]));
        } else {
          setCarregandoNotas(false);
        }
      })
      .catch((err) => { console.error(err); setErro("Não foi possível carregar os municípios."); setCarregandoNotas(false); });
  }, []);

  const carregarPagamentos = useCallback(async (id) => {
    if (!id) return;
    // Só busca quando mês (1–12) e ano (4 dígitos) estão completos
    if (!periodoValido(mes, ano)) return;
    setCarregandoNotas(true);
    try { setPagamentos(await listarPagamentosComNotas(id, mes, ano)); }
    catch (err) { console.error(err); setErro("Não foi possível carregar os pagamentos."); }
    finally { setCarregandoNotas(false); }
  }, [mes, ano]);

  useEffect(() => { if (municipioId) carregarPagamentos(municipioId); }, [municipioId, mes, ano, carregarPagamentos]);

  const carregarApuracoes = useCallback(async () => {
    setCarregandoApuracoes(true);
    try { setApuracoes(await listarApuracoes(12)); }
    catch (err) { console.error(err); setErro("Não foi possível carregar as apurações."); }
    finally { setCarregandoApuracoes(false); }
  }, []);

  useEffect(() => { if (aba === "tributos") carregarApuracoes(); }, [aba, carregarApuracoes]);

  const municipioAtual = municipios.find((m) => m.id === municipioId);

  // Município digitável: seleciona quando o texto bate com uma opção da lista
  function handleMunicipioChange(e) {
    const texto = e.target.value;
    setMunicipioBusca(texto);
    const exato = municipios.find((m) => normalizar(rotuloMunicipio(m)) === normalizar(texto));
    if (exato) setMunicipioId(exato.id);
  }

  // Ao sair do campo: se sobrou só uma opção compatível, usa ela; senão volta ao município atual
  function handleMunicipioBlur() {
    const termo = normalizar(municipioBusca);
    const exato = municipios.find((m) => normalizar(rotuloMunicipio(m)) === termo);
    if (exato) { setMunicipioId(exato.id); setMunicipioBusca(rotuloMunicipio(exato)); return; }

    const parecidos = termo ? municipios.filter((m) => normalizar(rotuloMunicipio(m)).includes(termo)) : [];
    if (parecidos.length === 1) {
      setMunicipioId(parecidos[0].id);
      setMunicipioBusca(rotuloMunicipio(parecidos[0]));
    } else if (municipioAtual) {
      setMunicipioBusca(rotuloMunicipio(municipioAtual));
    }
  }

  async function handleSalvarNota(dados) {
    if (modalNota.modo === "emitir") {
      await emitirNota({ pagamentoId: modalNota.pagamento.id, municipioId, valor: modalNota.pagamento.valor, numeroRps: dados.numeroRps });
    } else {
      await confirmarEmissao(modalNota.nota.id, dados);
    }
    await carregarPagamentos(municipioId);
  }

  async function handleCancelarNota(motivo) {
    await cancelarNota(modalCancelar.id, motivo);
    await carregarPagamentos(municipioId);
  }

  async function handleReemitir(nota) {
    await reemitirNota(nota);
    await carregarPagamentos(municipioId);
  }

  async function handleMarcarPago(apuracao) {
    await marcarApuracaoComoPaga(apuracao.id, new Date().toISOString().slice(0, 10));
    await carregarApuracoes();
  }

  const ultimaApuracao = apuracoes[apuracoes.length - 1];
  const receitaBruta12mSugerida = apuracoes.reduce((acc, a) => acc + Number(a.receita_bruta_mes), 0);

  return (
    <main className="flex min-h-screen bg-letra-bg">
      <SidebarAdmin />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-letra-border bg-white px-6 py-3.5">
          <h1 className="font-display text-lg font-extrabold text-letra-ink">Fiscal</h1>
          <p className="text-xs text-letra-ink2">Notas fiscais e tributos</p>
          <div className="mt-3 flex gap-1">
            <button onClick={() => setAba("notas")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${aba === "notas" ? "bg-letra-lilacSoft text-letra-lilac" : "text-letra-ink2"}`}>
              Notas Fiscais
            </button>
            <button onClick={() => setAba("tributos")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${aba === "tributos" ? "bg-letra-lilacSoft text-letra-lilac" : "text-letra-ink2"}`}>
              Tributos (DAS)
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {erro && <p className="mb-4 text-sm font-semibold text-letra-rose">{erro}</p>}

          {aba === "notas" && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Município / UF: digite para filtrar (ex.: "curi" ou "PR") */}
                  <input
                    list="lista-municipios"
                    value={municipioBusca}
                    onChange={handleMunicipioChange}
                    onBlur={handleMunicipioBlur}
                    onFocus={(e) => e.target.select()}
                    placeholder="Município ou UF"
                    autoComplete="off"
                    aria-label="Município ou UF"
                    className="w-64 rounded border border-letra-border px-2 py-1.5 text-sm"
                  />
                  <datalist id="lista-municipios">
                    {municipios.map((m) => (<option key={m.id} value={rotuloMunicipio(m)} />))}
                  </datalist>

                  <MesAnoFields
                    mes={mes} ano={ano} onMesChange={setMes} onAnoChange={setAno}
                    mesClassName="w-12 rounded border border-letra-border px-2 py-1.5 text-sm"
                    nomeClassName="w-24 text-sm text-letra-ink2"
                    anoClassName="w-20 rounded border border-letra-border px-2 py-1.5 text-sm"
                  />
                </div>
                <button onClick={() => setModalPagamentoAberto(true)} disabled={!municipioId}
                  className="btn-primary !bg-letra-lilac !px-4 !py-2 text-sm hover:!bg-[#6B2FD6] disabled:opacity-50">
                  + Registrar pagamento
                </button>
              </div>

              <section className="card overflow-hidden !p-0">
                <div className="border-b border-letra-border px-5 py-3.5">
                  <h3 className="text-sm font-extrabold text-letra-ink">Pagamentos e Notas — {municipioAtual?.nome}</h3>
                </div>
                {carregandoNotas ? (
                  <p className="px-5 py-4 text-sm text-letra-ink2">Carregando...</p>
                ) : pagamentos.length === 0 ? (
                  <p className="px-5 py-4 text-xs text-letra-ink3">Nenhum pagamento registrado ainda.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wide text-letra-ink2">
                        <th className="px-5 py-2.5">Pagamento</th>
                        <th className="px-5 py-2.5">Nota fiscal</th>
                        <th className="px-5 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagamentos.map((p) => (
                        <tr key={p.id} className="border-t border-letra-border">
                          <td className="px-5 py-3">
                            <p className="font-semibold text-letra-ink">R$ {Number(p.valor).toFixed(2)}</p>
                            <p className="text-xs text-letra-ink2">{new Date(p.data_pagamento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
                          </td>
                          <td className="px-5 py-3">
                            {p.notaAtiva ? (
                              <>
                                <span className={`badge-pill ${corStatusNota[p.notaAtiva.status]}`}>
                                  {p.notaAtiva.status === "pendente" ? "Pendente" : "Emitida"}
                                </span>
                                {p.notaAtiva.numero && <p className="mt-1 text-xs text-letra-ink2">Nº {p.notaAtiva.numero}</p>}
                              </>
                            ) : p.ultimaCancelada ? (
                              <span className="badge-pill bg-letra-roseSoft text-letra-rose">Cancelada</span>
                            ) : (
                              <span className="text-xs text-letra-ink3">Sem nota</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {!p.notaAtiva && !p.ultimaCancelada && (
                              <button onClick={() => setModalNota({ modo: "emitir", pagamento: p })} className="text-xs font-bold text-letra-indigo hover:underline">Emitir nota</button>
                            )}
                            {p.notaAtiva?.status === "pendente" && (
                              <div className="flex gap-3">
                                <button onClick={() => setModalNota({ modo: "confirmar", pagamento: p, nota: p.notaAtiva })} className="text-xs font-bold text-letra-indigo hover:underline">Confirmar emissão</button>
                                <button onClick={() => setModalCancelar(p.notaAtiva)} className="text-xs font-bold text-letra-rose hover:underline">Cancelar</button>
                              </div>
                            )}
                            {p.notaAtiva?.status === "emitida" && (
                              <div className="flex gap-3">
                                <button onClick={() => gerarNotaFiscalPdf({ nota: p.notaAtiva, municipioNome: municipioAtual ? rotuloMunicipio(municipioAtual) : undefined })} className="text-xs font-bold text-letra-mint hover:underline">Baixar PDF</button>
                                <button onClick={() => setModalCancelar(p.notaAtiva)} className="text-xs font-bold text-letra-rose hover:underline">Cancelar</button>
                              </div>
                            )}
                            {p.ultimaCancelada && (
                              <button onClick={() => handleReemitir(p.ultimaCancelada)} className="text-xs font-bold text-letra-indigo hover:underline">Reemitir</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}

          {aba === "tributos" && (
            <>
              <div className="mb-4 flex justify-end">
                <button onClick={() => setModalApuracaoAberto(true)} className="btn-primary !bg-letra-lilac !px-4 !py-2 text-sm hover:!bg-[#6B2FD6]">
                  + Nova apuração
                </button>
              </div>

              <section className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div className="card p-4">
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-letra-lilacSoft text-lg">💰</span>
                  <p className="font-display text-xl font-extrabold text-letra-lilac">R$ {ultimaApuracao ? Number(ultimaApuracao.valor_das).toFixed(2) : "0.00"}</p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">DAS provisionado {ultimaApuracao ? `${NOMES_MES[ultimaApuracao.mes - 1]}/${ultimaApuracao.ano}` : "—"}</p>
                </div>
                <div className="card p-4">
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-letra-indigoSoft text-lg">📊</span>
                  <p className="font-display text-xl font-extrabold text-letra-indigo">R$ {ultimaApuracao ? Number(ultimaApuracao.receita_bruta_mes).toFixed(2) : "0.00"}</p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Receita bruta do mês</p>
                </div>
                <div className="card p-4">
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-letra-mintSoft text-lg">📈</span>
                  <p className="font-display text-xl font-extrabold text-letra-mint">{ultimaApuracao ? Number(ultimaApuracao.aliquota_efetiva).toFixed(2) : "0.00"}%</p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">Alíquota efetiva</p>
                </div>
              </section>

              <section className="card overflow-hidden !p-0">
                <div className="border-b border-letra-border px-5 py-3.5">
                  <h3 className="text-sm font-extrabold text-letra-ink">Histórico de apurações</h3>
                </div>
                {carregandoApuracoes ? (
                  <p className="px-5 py-4 text-sm text-letra-ink2">Carregando...</p>
                ) : apuracoes.length === 0 ? (
                  <p className="px-5 py-4 text-xs text-letra-ink3">Nenhuma apuração registrada ainda.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wide text-letra-ink2">
                        <th className="px-5 py-2.5">Competência</th>
                        <th className="px-5 py-2.5">Receita bruta</th>
                        <th className="px-5 py-2.5">Alíquota</th>
                        <th className="px-5 py-2.5">DAS</th>
                        <th className="px-5 py-2.5">Vencimento</th>
                        <th className="px-5 py-2.5">Status</th>
                        <th className="px-5 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...apuracoes].reverse().map((a) => (
                        <tr key={a.id} className="border-t border-letra-border">
                          <td className="px-5 py-3 font-semibold text-letra-ink">{NOMES_MES[a.mes - 1]}/{a.ano}</td>
                          <td className="px-5 py-3 text-letra-ink2">R$ {Number(a.receita_bruta_mes).toFixed(2)}</td>
                          <td className="px-5 py-3 text-letra-ink2">{Number(a.aliquota_efetiva).toFixed(2)}%</td>
                          <td className="px-5 py-3 font-bold text-letra-lilac">R$ {Number(a.valor_das).toFixed(2)}</td>
                          <td className="px-5 py-3 text-letra-ink2">{a.data_vencimento ? new Date(a.data_vencimento).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—"}</td>
                          <td className="px-5 py-3">
                            <span className={`badge-pill ${a.status === "pago" ? "bg-letra-mintSoft text-[#065F46]" : "bg-letra-goldSoft text-[#7A4F00]"}`}>
                              {a.status === "pago" ? "Pago" : "Provisionado"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {a.status === "provisionado" && (
                              <button onClick={() => handleMarcarPago(a)} className="text-xs font-bold text-letra-indigo hover:underline">Marcar como pago</button>
                            )}
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

      <ModalRegistrarPagamento aberto={modalPagamentoAberto} onFechar={() => setModalPagamentoAberto(false)}
        onSalvo={() => carregarPagamentos(municipioId)} municipioId={municipioId} municipioNome={municipioAtual?.nome} valorSugerido={municipioAtual?.valor_mensal} />

      <ModalNotaFiscal aberto={!!modalNota} onFechar={() => setModalNota(null)}
        onSalvar={handleSalvarNota} modo={modalNota?.modo} pagamento={modalNota?.pagamento} />

      <ModalCancelarNota aberto={!!modalCancelar} onFechar={() => setModalCancelar(null)} onConfirmar={handleCancelarNota} />

      <ModalApuracao aberto={modalApuracaoAberto} onFechar={() => setModalApuracaoAberto(false)}
        onSalvar={async (dados) => { await criarApuracao(dados); await carregarApuracoes(); }}
        receitaBruta12mSugerida={receitaBruta12mSugerida} />
    </main>
  );
}