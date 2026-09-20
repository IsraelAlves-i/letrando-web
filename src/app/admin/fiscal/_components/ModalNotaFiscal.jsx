"use client";

import { useEffect, useState } from "react";

export default function ModalNotaFiscal({ aberto, onFechar, onSalvar, modo, pagamento }) {
  const [numeroRps, setNumeroRps] = useState("");
  const [numero, setNumero] = useState("");
  const [codigoVerificacao, setCodigoVerificacao] = useState("");
  const [linkPdf, setLinkPdf] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) { setNumeroRps(""); setNumero(""); setCodigoVerificacao(""); setLinkPdf(""); setErro(""); }
  }, [aberto, modo]);

  if (!aberto) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    if (modo === "confirmar" && !numero) { setErro("Informe o número da NFS-e emitida pela prefeitura."); return; }

    setSalvando(true);
    try {
      if (modo === "emitir") await onSalvar({ numeroRps });
      else await onSalvar({ numero, codigoVerificacao, linkPdf });
      onFechar();
    } catch (err) {
      setErro("Erro ao salvar. Tente novamente.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 font-display text-lg font-extrabold text-letra-ink">
          {modo === "emitir" ? "Emitir NFS-e" : "Confirmar emissão"}
        </h2>
        <p className="mb-4 text-xs text-letra-ink2">Pagamento de R$ {Number(pagamento?.valor ?? 0).toFixed(2)}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {modo === "emitir" ? (
            <input type="text" placeholder="Número do RPS (opcional)" value={numeroRps}
              onChange={(e) => setNumeroRps(e.target.value)}
              className="rounded-xl border border-letra-border px-3 py-2 text-sm" />
          ) : (
            <>
              <input type="text" placeholder="Número da NFS-e" value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="rounded-xl border border-letra-border px-3 py-2 text-sm" />
              <input type="text" placeholder="Código de verificação (opcional)" value={codigoVerificacao}
                onChange={(e) => setCodigoVerificacao(e.target.value)}
                className="rounded-xl border border-letra-border px-3 py-2 text-sm" />
              <input type="text" placeholder="Link do PDF (opcional)" value={linkPdf}
                onChange={(e) => setLinkPdf(e.target.value)}
                className="rounded-xl border border-letra-border px-3 py-2 text-sm" />
            </>
          )}

          {erro && <p className="text-xs font-semibold text-letra-rose">{erro}</p>}

          <div className="mt-2 flex gap-2">
            <button type="button" onClick={onFechar} className="flex-1 rounded-xl border border-letra-border py-2.5 text-sm font-bold text-letra-ink2">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary flex-1 !bg-letra-lilac text-sm hover:!bg-[#6B2FD6] disabled:opacity-60">
              {salvando ? "Salvando..." : modo === "emitir" ? "Emitir" : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}