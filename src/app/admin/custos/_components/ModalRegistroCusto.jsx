"use client";

import { useEffect, useState } from "react";

const NOMES_MES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default function ModalRegistroCusto({ aberto, onFechar, onSalvar, escolaId, escolaNome, alunosAtivosSugestao }) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [custoTotal, setCustoTotal] = useState("");
  const [totalAlunosAtivos, setTotalAlunosAtivos] = useState("");
  const [limiarAlerta, setLimiarAlerta] = useState("0.50");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setMes(hoje.getMonth() + 1);
      setAno(hoje.getFullYear());
      setCustoTotal("");
      setTotalAlunosAtivos(alunosAtivosSugestao ? String(alunosAtivosSugestao) : "");
      setLimiarAlerta("0.50");
      setErro("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  if (!aberto) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!custoTotal || !totalAlunosAtivos) {
      setErro("Preencha custo total e alunos ativos.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        escolaId,
        mes: Number(mes),
        ano: Number(ano),
        custoTotal: Number(custoTotal),
        totalAlunosAtivos: Number(totalAlunosAtivos),
        limiarAlerta: Number(limiarAlerta),
      });
      onFechar();
    } catch (err) {
      setErro("Erro ao salvar registro. Tente novamente.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 font-display text-lg font-extrabold text-letra-ink">Registrar mês</h2>
        <p className="mb-4 text-xs text-letra-ink2">{escolaNome}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select value={mes} onChange={(e) => setMes(e.target.value)}
              className="flex-1 rounded-xl border border-letra-border px-3 py-2 text-sm">
              {NOMES_MES.map((nome, i) => (
                <option key={nome} value={i + 1}>{nome}</option>
              ))}
            </select>
            <input type="number" value={ano} onChange={(e) => setAno(e.target.value)}
              className="w-24 rounded-xl border border-letra-border px-3 py-2 text-sm" />
          </div>

          <input type="number" step="0.01" placeholder="Custo total (R$)"
            value={custoTotal} onChange={(e) => setCustoTotal(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />

          <input type="number" placeholder="Alunos ativos no mês"
            value={totalAlunosAtivos} onChange={(e) => setTotalAlunosAtivos(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-letra-ink2">Limiar de alerta (R$/aluno)</label>
            <input type="number" step="0.01" value={limiarAlerta}
              onChange={(e) => setLimiarAlerta(e.target.value)}
              className="w-full rounded-xl border border-letra-border px-3 py-2 text-sm" />
          </div>

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