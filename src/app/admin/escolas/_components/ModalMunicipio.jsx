"use client";

import { useEffect, useState } from "react";

const STATUS_OPCOES = [
  { valor: "ativa", rotulo: "Ativa" },
  { valor: "suspensa", rotulo: "Suspensa" },
  { valor: "vencida", rotulo: "Vencida" },
  { valor: "cancelada", rotulo: "Cancelada" },
];

export default function ModalMunicipio({ aberto, onFechar, onSalvar, municipioEditando }) {
  const [nome, setNome] = useState("");
  const [uf, setUf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [valorMensal, setValorMensal] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [statusAssinatura, setStatusAssinatura] = useState("ativa");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (municipioEditando) {
      setNome(municipioEditando.nome ?? "");
      setUf(municipioEditando.uf ?? "");
      setCnpj(municipioEditando.cnpj ?? "");
      setValorMensal(municipioEditando.valor_mensal ?? "");
      setDataVencimento(municipioEditando.data_vencimento ?? "");
      setStatusAssinatura(municipioEditando.status_assinatura ?? "ativa");
    } else {
      setNome(""); setUf(""); setCnpj(""); setValorMensal(""); setDataVencimento(""); setStatusAssinatura("ativa");
    }
    setErro("");
  }, [municipioEditando, aberto]);

  if (!aberto) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!nome || !valorMensal || !dataVencimento) {
      setErro("Preencha nome, valor mensal e vencimento.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({ nome, uf, cnpj, valorMensal: Number(valorMensal), dataVencimento, statusAssinatura });
      onFechar();
    } catch (err) {
      setErro("Erro ao salvar município. Tente novamente.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-lg font-extrabold text-letra-ink">
          {municipioEditando ? "Configurar município" : "Cadastrar município"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input type="text" placeholder="Nome do município" value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="flex-1 rounded-xl border border-letra-border px-3 py-2 text-sm" />
            <input type="text" placeholder="UF" maxLength={2} value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase())}
              className="w-16 rounded-xl border border-letra-border px-3 py-2 text-sm" />
          </div>

          <input type="text" placeholder="CNPJ da prefeitura (opcional)" value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />

          <input type="number" step="0.01" placeholder="Valor mensal (ex: 1500.00)" value={valorMensal}
            onChange={(e) => setValorMensal(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />

          <input type="date" value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />

          <select value={statusAssinatura} onChange={(e) => setStatusAssinatura(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm">
            {STATUS_OPCOES.map((s) => (
              <option key={s.valor} value={s.valor}>{s.rotulo}</option>
            ))}
          </select>

          {erro && <p className="text-xs font-semibold text-letra-rose">{erro}</p>}

          <div className="mt-2 flex gap-2">
            <button type="button" onClick={onFechar}
              className="flex-1 rounded-xl border border-letra-border py-2.5 text-sm font-bold text-letra-ink2">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="btn-primary flex-1 !bg-letra-lilac text-sm hover:!bg-[#6B2FD6] disabled:opacity-60">
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}