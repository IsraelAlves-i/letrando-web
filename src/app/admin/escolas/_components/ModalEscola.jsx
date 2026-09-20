"use client";

import { useEffect, useState } from "react";

export default function ModalEscola({ aberto, onFechar, onSalvar, municipios, escolaEditando }) {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [municipioId, setMunicipioId] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (escolaEditando) {
      setNome(escolaEditando.nome ?? "");
      setCnpj(escolaEditando.cnpj ?? "");
      setMunicipioId(escolaEditando.municipio_id ?? "");
    } else {
      setNome("");
      setCnpj("");
      setMunicipioId(municipios?.[0]?.id ?? "");
    }
    setErro("");
  }, [escolaEditando, aberto, municipios]);

  if (!aberto) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!nome || !municipioId) {
      setErro("Preencha nome e município.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({ nome, cnpj, municipioId });
      onFechar();
    } catch (err) {
      setErro("Erro ao salvar escola. Tente novamente.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-lg font-extrabold text-letra-ink">
          {escolaEditando ? "Configurar escola" : "Cadastrar escola"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Nome da escola" value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />

          <input type="text" placeholder="CNPJ (opcional)" value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm" />

          <select value={municipioId} onChange={(e) => setMunicipioId(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm">
            <option value="">Selecione o município</option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}{m.uf ? ` — ${m.uf}` : ""}</option>
            ))}
          </select>
          {municipios.length === 0 && (
            <p className="text-[11px] text-letra-ink3">Nenhum município cadastrado ainda — cadastre um primeiro.</p>
          )}

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