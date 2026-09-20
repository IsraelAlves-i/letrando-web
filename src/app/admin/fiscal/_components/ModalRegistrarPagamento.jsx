"use client";

import { useEffect, useState } from "react";
import { listarFormasPagamento, criarFormaPagamento, registrarPagamento } from "@/lib/fiscal";

export default function ModalRegistrarPagamento({ aberto, onFechar, onSalvo, escolaId, valorSugerido }) {
  const [formas, setFormas] = useState([]);
  const [formaPagamentoId, setFormaPagamentoId] = useState("");
  const [novaForma, setNovaForma] = useState(false);
  const [tipoNovaForma, setTipoNovaForma] = useState("Pix");
  const [dadosNovaForma, setDadosNovaForma] = useState("");
  const [valor, setValor] = useState("");
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto && escolaId) {
      listarFormasPagamento(escolaId).then(setFormas).catch(console.error);
      setValor(valorSugerido ? String(valorSugerido) : "");
      setDataPagamento(new Date().toISOString().slice(0, 10));
      setNovaForma(false);
      setFormaPagamentoId("");
      setErro("");
    }
  }, [aberto, escolaId, valorSugerido]);

  if (!aberto) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!valor) { setErro("Informe o valor pago."); return; }
    if (!novaForma && !formaPagamentoId) { setErro("Selecione uma forma de pagamento ou cadastre uma nova."); return; }
    if (novaForma && !dadosNovaForma) { setErro("Preencha os dados da nova forma de pagamento."); return; }

    setSalvando(true);
    try {
      let formaId = formaPagamentoId;
      if (novaForma) {
        const forma = await criarFormaPagamento({ escolaId, tipo: tipoNovaForma, dados: dadosNovaForma });
        formaId = forma.id;
      }
      const pagamento = await registrarPagamento({ escolaId, valor: Number(valor), dataPagamento, formaPagamentoId: formaId });
      onSalvo(pagamento);
      onFechar();
    } catch (err) {
      setErro("Erro ao registrar pagamento. Tente novamente.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-lg font-extrabold text-letra-ink">Registrar pagamento</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="number" step="0.01" placeholder="Valor pago (R$)" value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />

          <input type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />

          {!novaForma ? (
            <>
              <select value={formaPagamentoId} onChange={(e) => setFormaPagamentoId(e.target.value)}
                className="rounded-xl border border-letra-border px-3 py-2 text-sm">
                <option value="">Selecione a forma de pagamento</option>
                {formas.map((f) => (
                  <option key={f.id} value={f.id}>{f.tipo} — {f.dados}</option>
                ))}
              </select>
              <button type="button" onClick={() => setNovaForma(true)} className="text-left text-xs font-bold text-letra-indigo hover:underline">
                + Cadastrar nova forma de pagamento
              </button>
            </>
          ) : (
            <>
              <select value={tipoNovaForma} onChange={(e) => setTipoNovaForma(e.target.value)}
                className="rounded-xl border border-letra-border px-3 py-2 text-sm">
                <option value="Pix">Pix</option>
                <option value="Boleto">Boleto</option>
                <option value="Cartão">Cartão</option>
                <option value="Transferência">Transferência</option>
              </select>
              <input type="text" placeholder="Chave Pix, banco, etc." value={dadosNovaForma}
                onChange={(e) => setDadosNovaForma(e.target.value)}
                className="rounded-xl border border-letra-border px-3 py-2 text-sm" />
              <button type="button" onClick={() => setNovaForma(false)} className="text-left text-xs font-bold text-letra-ink2 hover:underline">
                Usar forma já cadastrada
              </button>
            </>
          )}

          {erro && <p className="text-xs font-semibold text-letra-rose">{erro}</p>}

          <div className="mt-2 flex gap-2">
            <button type="button" onClick={onFechar} className="flex-1 rounded-xl border border-letra-border py-2.5 text-sm font-bold text-letra-ink2">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary flex-1 !bg-letra-lilac text-sm hover:!bg-[#6B2FD6] disabled:opacity-60">
              {salvando ? "Salvando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}