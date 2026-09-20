"use client";

import { useEffect, useState } from "react";
import {
  criarLancamento,
  listarMunicipiosComContagem,
  criarMunicipio,
  CATEGORIAS_ENTRADA,
  CATEGORIAS_SAIDA,
} from "@/lib/financeiro";

export default function ModalLancamento({ aberto, onFechar, onSucesso }) {
  const [tipo, setTipo] = useState("entrada");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataLancamento, setDataLancamento] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [municipios, setMunicipios] = useState([]);
  const [municipioId, setMunicipioId] = useState("");
  const [criandoMunicipio, setCriandoMunicipio] = useState(false);
  const [novoMunicipioNome, setNovoMunicipioNome] = useState("");
  const [novoMunicipioUf, setNovoMunicipioUf] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      listarMunicipiosComContagem().then(setMunicipios).catch(console.error);
    }
  }, [aberto]);

  if (!aberto) return null;

  const categorias = tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;
  const municipioSelecionado = municipios.find((m) => m.id === municipioId);

  async function handleCriarMunicipio() {
    if (!novoMunicipioNome) return;
    try {
      const novo = await criarMunicipio({ nome: novoMunicipioNome, uf: novoMunicipioUf });
      setMunicipios((atual) => [...atual, { ...novo, qtdEscolas: 0 }]);
      setMunicipioId(novo.id);
      setCriandoMunicipio(false);
      setNovoMunicipioNome("");
      setNovoMunicipioUf("");
    } catch (err) {
      setErro("Erro ao criar município.");
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!categoria || !valor) {
      setErro("Preencha categoria e valor.");
      return;
    }
    if (tipo === "entrada" && !municipioId) {
      setErro("Selecione o município.");
      return;
    }

    setSalvando(true);
    try {
      await criarLancamento({
        tipo,
        categoria,
        descricao,
        valor: Number(valor),
        dataLancamento,
        municipioId: tipo === "entrada" ? municipioId : undefined,
      });
      onSucesso?.();
      onFechar();
      setCategoria("");
      setDescricao("");
      setValor("");
      setMunicipioId("");
    } catch (err) {
      setErro("Erro ao salvar lançamento. Tente novamente.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-display text-lg font-extrabold text-letra-ink">
          Registrar lançamento
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTipo("entrada"); setCategoria(""); }}
              className={`flex-1 rounded-xl py-2 text-sm font-bold ${
                tipo === "entrada" ? "bg-letra-mintSoft text-[#065F46]" : "bg-letra-bg text-letra-ink2"
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => { setTipo("saida"); setCategoria(""); }}
              className={`flex-1 rounded-xl py-2 text-sm font-bold ${
                tipo === "saida" ? "bg-letra-roseSoft text-letra-rose" : "bg-letra-bg text-letra-ink2"
              }`}
            >
              Saída
            </button>
          </div>

          {tipo === "entrada" && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-letra-ink2">Município (cliente)</label>
              {!criandoMunicipio ? (
                <>
                  <select
                    value={municipioId}
                    onChange={(e) => setMunicipioId(e.target.value)}
                    className="w-full rounded-xl border border-letra-border px-3 py-2 text-sm"
                  >
                    <option value="">Selecione o município</option>
                    {municipios.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}{m.uf ? ` — ${m.uf}` : ""} ({m.qtdEscolas} {m.qtdEscolas === 1 ? "escola" : "escolas"})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setCriandoMunicipio(true)}
                    className="mt-1 text-[11px] font-semibold text-letra-indigo hover:underline"
                  >
                    + Cadastrar novo município
                  </button>
                  {municipioSelecionado && (
                    <p className="mt-1 text-[10px] text-letra-ink3">
                      {municipioSelecionado.qtdEscolas} {municipioSelecionado.qtdEscolas === 1 ? "escola cadastrada" : "escolas cadastradas"} nesse município.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2 rounded-xl border border-dashed border-letra-border p-3">
                  <input
                    type="text"
                    placeholder="Nome do município"
                    value={novoMunicipioNome}
                    onChange={(e) => setNovoMunicipioNome(e.target.value)}
                    className="rounded-lg border border-letra-border px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="UF (ex: PR)"
                    maxLength={2}
                    value={novoMunicipioUf}
                    onChange={(e) => setNovoMunicipioUf(e.target.value.toUpperCase())}
                    className="rounded-lg border border-letra-border px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCriandoMunicipio(false)} className="flex-1 rounded-lg border border-letra-border py-1.5 text-xs font-bold text-letra-ink2">
                      Cancelar
                    </button>
                    <button type="button" onClick={handleCriarMunicipio} className="flex-1 rounded-lg bg-letra-lilac py-1.5 text-xs font-bold text-white">
                      Criar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm"
          >
            <option value="">{tipo === "entrada" ? "Tipo de receita" : "Categoria do custo"}</option>
            {categorias.map((c) => (
              <option key={c.valor} value={c.valor}>{c.icone} {c.valor}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Valor (ex: 150.00)"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={dataLancamento}
            onChange={(e) => setDataLancamento(e.target.value)}
            className="rounded-xl border border-letra-border px-3 py-2 text-sm"
          />

          {erro && <p className="text-xs font-semibold text-letra-rose">{erro}</p>}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 rounded-xl border border-letra-border py-2.5 text-sm font-bold text-letra-ink2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="btn-primary flex-1 !bg-letra-lilac text-sm hover:!bg-[#6B2FD6] disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}