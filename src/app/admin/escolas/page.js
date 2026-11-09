"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SidebarAdmin from "../_components/SidebarAdmin";
import ModalEscola from "./_components/ModalEscola";
import ModalMunicipio from "./_components/ModalMunicipio";
import StatusBadge from "../_components/StatusBadge";
import {
  listarEscolas, listarMunicipiosComAssinatura,
  criarEscola, atualizarEscola, criarMunicipioComAssinatura, atualizarMunicipio,
} from "@/lib/escolas";



function formatarData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatarReal(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function GestaoEscolasPage() {
  const [municipios, setMunicipios] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalEscolaAberto, setModalEscolaAberto] = useState(false);
  const [escolaEditando, setEscolaEditando] = useState(null);
  const [modalMunicipioAberto, setModalMunicipioAberto] = useState(false);
  const [municipioEditando, setMunicipioEditando] = useState(null);

  const [busca, setBusca] = useState("");
  const [filtroMunicipioId, setFiltroMunicipioId] = useState("");

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [municipiosData, escolasData] = await Promise.all([
        listarMunicipiosComAssinatura(), listarEscolas(),
      ]);
      setMunicipios(municipiosData);
      setEscolas(escolasData);
    } catch (err) {
      console.error("Erro ao carregar escolas/municípios:", err);
      setErro("Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const municipiosComStatus = municipios;
  const municipiosPagos = municipiosComStatus.filter((m) => m.status_assinatura === "pago");
  const mrrTotal = municipiosPagos.reduce((acc, m) => acc + Number(m.valor_mensal || 0), 0);
  const totalProfessores = escolas.reduce((acc, e) => acc + e.totalProfessores, 0);
  const totalAlunos = escolas.reduce((acc, e) => acc + e.totalAlunos, 0);
  const emAtraso = municipiosComStatus.filter((m) => m.status_assinatura === "vencido_30" || m.status_assinatura === "vencido_60").length;

  const kpis = [
    { icone: "🏛️", cor: "bg-letra-lilacSoft", label: "Municípios pagos", valor: municipiosPagos.length },
    { icone: "💰", cor: "bg-letra-mintSoft", label: "MRR total", valor: formatarReal(mrrTotal), valorCor: "text-letra-mint" },
    { icone: "🏫", cor: "bg-letra-indigoSoft", label: "Escolas cadastradas", valor: escolas.length, valorCor: "text-letra-indigo" },
    { icone: "⚠️", cor: "bg-letra-roseSoft", label: "Em atraso (30/60 dias)", valor: emAtraso, valorCor: "text-letra-rose" },
  ];

  const escolasFiltradas = useMemo(() => {
    return escolas.filter((e) => {
      const bateBusca = !busca || e.nome.toLowerCase().includes(busca.toLowerCase());
      const bateMunicipio = !filtroMunicipioId || e.municipio_id === filtroMunicipioId;
      return bateBusca && bateMunicipio;
    });
  }, [escolas, busca, filtroMunicipioId]);

  function abrirCadastroEscola() { setEscolaEditando(null); setModalEscolaAberto(true); }
  function abrirConfigEscola(escola) { setEscolaEditando(escola); setModalEscolaAberto(true); }
  function abrirCadastroMunicipio() { setMunicipioEditando(null); setModalMunicipioAberto(true); }
  function abrirConfigMunicipio(municipio) { setMunicipioEditando(municipio); setModalMunicipioAberto(true); }

  async function handleSalvarEscola(campos) {
    if (escolaEditando) {
      await atualizarEscola(escolaEditando.id, { nome: campos.nome, cnpj: campos.cnpj, municipio_id: campos.municipioId });
    } else {
      await criarEscola(campos);
    }
    await carregarDados();
  }

  async function handleSalvarMunicipio(campos) {
    if (municipioEditando) {
      await atualizarMunicipio(municipioEditando.id, {
        nome: campos.nome, uf: campos.uf, cnpj: campos.cnpj,
        valor_mensal: campos.valorMensal, data_vencimento: campos.dataVencimento,
        status_assinatura: campos.statusAssinatura,
      });
    } else {
      await criarMunicipioComAssinatura(campos);
    }
    await carregarDados();
  }

  return (
    <main className="flex min-h-screen bg-letra-bg">
      <SidebarAdmin />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-letra-border bg-white px-6 py-3.5">
          <div>
            <h1 className="font-display text-lg font-extrabold text-letra-ink">Gestão de Municípios e Escolas</h1>
            <p className="text-xs text-letra-ink2">Assinaturas B2G · Módulo Financeiro</p>
          </div>
          <div className="flex gap-2">
            <button onClick={abrirCadastroMunicipio}
              className="rounded-xl border border-letra-lilac px-4 py-2.5 text-sm font-bold text-letra-lilac hover:bg-letra-lilacSoft">
              + Cadastrar Município
            </button>
            <button onClick={abrirCadastroEscola}
              className="btn-primary !bg-letra-lilac !px-5 !py-2.5 text-sm hover:!bg-[#6B2FD6]">
              + Cadastrar Escola
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {erro && <p className="mb-4 text-sm font-semibold text-letra-rose">{erro}</p>}

          <section className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="card flex items-center gap-3 p-4">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${kpi.cor}`}>{kpi.icone}</span>
                <div>
                  <p className={`font-display text-xl font-extrabold leading-none ${kpi.valorCor ?? "text-letra-ink"}`}>{kpi.valor}</p>
                  <p className="mt-1 text-[11px] font-semibold text-letra-ink2">{kpi.label}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Municípios (clientes / assinatura) */}
          <section className="card mb-5 overflow-hidden !p-0">
            <div className="border-b border-letra-border px-5 py-3.5">
              <h3 className="text-sm font-extrabold text-letra-ink">Municípios contratantes</h3>
            </div>
            {carregando ? (
              <p className="px-5 py-4 text-sm text-letra-ink2">Carregando...</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wide text-letra-ink2">
                    <th className="px-5 py-2.5">Município</th>
                    <th className="px-5 py-2.5">Nº escolas</th>
                    <th className="px-5 py-2.5">Valor mensal</th>
                    <th className="px-5 py-2.5">Vencimento</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {municipiosComStatus.map((m) => (
                    <tr key={m.id} className="border-t border-letra-border hover:bg-[#FAFBFF]">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-letra-ink">{m.nome}{m.uf ? ` — ${m.uf}` : ""}</p>
                        <p className="text-xs text-letra-ink2">{m.cnpj ?? "—"}</p>
                      </td>
                      <td className="px-5 py-3 text-letra-ink2">{m.qtdEscolas}</td>
                      <td className="px-5 py-3 font-bold text-letra-lilac">{formatarReal(m.valor_mensal)}</td>
                      <td className={`px-5 py-3 ${m.status_assinatura.startsWith("vencido") ? "font-semibold text-letra-rose" : "text-letra-ink2"}`}>
                        {formatarData(m.data_vencimento)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={m.status_assinatura} />
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => abrirConfigMunicipio(m)} className="text-xs font-bold text-letra-indigo hover:underline">
                          Configurar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {municipiosComStatus.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-4 text-xs text-letra-ink3">Nenhum município cadastrado ainda.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </section>

          {/* Escolas: busca + filtro por município */}
          <section className="card overflow-hidden !p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-letra-border px-5 py-3.5">
              <h3 className="text-sm font-extrabold text-letra-ink">Escolas</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar escola pelo nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="rounded-lg border border-letra-border px-3 py-1.5 text-xs"
                />
                <select
                  value={filtroMunicipioId}
                  onChange={(e) => setFiltroMunicipioId(e.target.value)}
                  className="rounded-lg border border-letra-border px-2 py-1.5 text-xs"
                >
                  <option value="">Todos os municípios</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome}{m.uf ? ` — ${m.uf}` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            {carregando ? (
              <p className="px-5 py-4 text-sm text-letra-ink2">Carregando...</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wide text-letra-ink2">
                    <th className="px-5 py-2.5">Escola</th>
                    <th className="px-5 py-2.5">Município</th>
                    <th className="px-5 py-2.5">Professores</th>
                    <th className="px-5 py-2.5">Alunos</th>
                    <th className="px-5 py-2.5">Código</th>
                    <th className="px-5 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {escolasFiltradas.map((e) => (
                    <tr key={e.id} className="border-t border-letra-border hover:bg-[#FAFBFF]">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-letra-ink">{e.nome}</p>
                        <p className="text-xs text-letra-ink2">{e.cnpj ?? "—"}</p>
                      </td>
                      <td className="px-5 py-3 text-letra-ink2">{e.municipio?.nome ?? "—"}{e.municipio?.uf ? ` — ${e.municipio.uf}` : ""}</td>
                      <td className="px-5 py-3 text-letra-ink2">{e.totalProfessores}</td>
                      <td className="px-5 py-3 text-letra-ink2">{e.totalAlunos}</td>
                      <td className="px-5 py-3 font-mono text-xs font-bold text-letra-indigo">{e.codigo_acesso}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => abrirConfigEscola(e)} className="text-xs font-bold text-letra-indigo hover:underline">
                          Configurar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {escolasFiltradas.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-4 text-xs text-letra-ink3">Nenhuma escola encontrada.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>

      <ModalEscola aberto={modalEscolaAberto} onFechar={() => setModalEscolaAberto(false)}
        onSalvar={handleSalvarEscola} municipios={municipios} escolaEditando={escolaEditando} />

      <ModalMunicipio aberto={modalMunicipioAberto} onFechar={() => setModalMunicipioAberto(false)}
        onSalvar={handleSalvarMunicipio} municipioEditando={municipioEditando} />
    </main>
  );
}
