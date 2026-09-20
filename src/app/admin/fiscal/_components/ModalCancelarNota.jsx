"use client";

import { useState } from "react";

export default function ModalCancelarNota({ aberto, onFechar, onConfirmar }) {
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  if (!aberto) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!motivo) { setErro("Informe o motivo do cancelamento."); return; }
    setSalvando(true);
    try {
      await onConfirmar(motivo);
      setMotivo("");
      onFechar();
    } catch (err) {
      setErro("Erro ao cancelar. Tente novamente.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-lg font-extrabold text-letra-ink">Cancelar nota fiscal</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea placeholder="Motivo do cancelamento" value={motivo}
            onChange={(e) => setMotivo(e.target.value)} rows={3}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />
          {erro && <p className="text-xs font-semibold text-letra-rose">{erro}</p>}
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={onFechar} className="flex-1 rounded-xl border border-letra-border py-2.5 text-sm font-bold text-letra-ink2">Voltar</button>
            <button type="submit" disabled={salvando} className="btn-primary flex-1 !bg-letra-rose text-sm hover:!bg-[#B91C1C] disabled:opacity-60">
              {salvando ? "Cancelando..." : "Confirmar cancelamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}