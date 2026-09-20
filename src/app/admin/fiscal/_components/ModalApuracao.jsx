"use client";

import { useEffect, useState } from "react";
import { sugerirReceitaBrutaMes } from "@/lib/fiscal";

const NOMES_MES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default function ModalApuracao({ aberto, onFechar, onSalvar, receitaBruta12mSugerida }) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [receitaBrutaMes, setReceitaBrutaMes] = useState("");
  const [receitaBruta12m, setReceitaBruta12m] = useState("");
  const [aliquotaEfetiva, setAliquotaEfetiva] = useState("6.00");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setMes(hoje.getMonth() + 1);
      setAno(hoje.getFullYear());
      setReceitaBruta12m(receitaBruta12mSugerida ? String(receitaBruta12mSugerida) : "");
      setAliquotaEfetiva("6.00");
      setErro("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  useEffect(() => {
    if (aberto) sugerirReceitaBrutaMes(mes, ano).then((v) => setReceitaBrutaMes(String(v))).catch(console.error);
  }, [aberto, mes, ano]);

  if (!aberto) return null;

  function dataVencimentoSugerida() {
    const proximoMes = mes === 12 ? 1 : mes + 1;
    const anoVencimento = mes === 12 ? ano + 1 : ano;
    return `${anoVencimento}-${String(proximoMes).padStart(2, "0")}-20`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    if (!receitaBrutaMes || !aliquotaEfetiva) { setErro("Preencha receita do mês e alíquota."); return; }
    setSalvando(true);
    try {
      await onSalvar({
        mes: Number(mes), ano: Number(ano),
        receitaBrutaMes: Number(receitaBrutaMes),
        receitaBruta12m: Number(receitaBruta12m || 0),
        aliquotaEfetiva: Number(aliquotaEfetiva),
        dataVencimento: dataVencimentoSugerida(),
      });
      onFechar();
    } catch (err) {
      setErro("Erro ao salvar. Verifique se já existe apuração para esse mês.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-lg font-extrabold text-letra-ink">Nova apuração (DAS)</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
              className="flex-1 rounded-xl border border-letra-border px-3 py-2 text-sm">
              {NOMES_MES.map((nome, i) => (<option key={nome} value={i + 1}>{nome}</option>))}
            </select>
            <input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))}
              className="w-24 rounded-xl border border-letra-border px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-letra-ink2">Receita bruta do mês (R$)</label>
            <input type="number" step="0.01" value={receitaBrutaMes} onChange={(e) => setReceitaBrutaMes(e.target.value)}
              className="w-full rounded-xl border border-letra-border px-3 py-2 text-sm" />
            <p className="mt-1 text-[10px] text-letra-ink3">Sugerido a partir dos pagamentos confirmados no mês — ajuste se necessário.</p>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-letra-ink2">Receita bruta últimos 12 meses (RBT12)</label>
            <input type="number" step="0.01" value={receitaBruta12m} onChange={(e) => setReceitaBruta12m(e.target.value)}
              className="w-full rounded-xl border border-letra-border px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-letra-ink2">Alíquota efetiva (%)</label>
            <input type="number" step="0.01" value={aliquotaEfetiva} onChange={(e) => setAliquotaEfetiva(e.target.value)}
              className="w-full rounded-xl border border-letra-border px-3 py-2 text-sm" />
            <p className="mt-1 text-[10px] text-letra-ink3">Confirme com seu contador a faixa do Simples pro seu RBT12/anexo.</p>
          </div>

          {erro && <p className="text-xs font-semibold text-letra-rose">{erro}</p>}

          <div className="mt-2 flex gap-2">
            <button type="button" onClick={onFechar} className="flex-1 rounded-xl border border-letra-border py-2.5 text-sm font-bold text-letra-ink2">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary flex-1 !bg-letra-lilac text-sm hover:!bg-[#6B2FD6] disabled:opacity-60">
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}