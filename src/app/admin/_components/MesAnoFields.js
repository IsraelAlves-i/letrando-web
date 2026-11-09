"use client";

import { useEffect, useState } from "react";

export const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const soDigitos = (s) => String(s ?? "").replace(/\D/g, "");

/** true quando mês (1–12) e ano (4 dígitos) estão completos — use antes de buscar dados */
export function periodoValido(mes, ano) {
  return mes >= 1 && mes <= 12 && ano >= 1000;
}

/**
 * Mês digitável (1–12). Mostra o nome do mês ao lado.
 * value: número 1–12 ou null | onChange(número | null)
 */
export function MesInput({
  value,
  onChange,
  inputClassName = "w-10 rounded border border-letra-border px-1 text-xs",
  nomeClassName = "w-20 text-xs text-letra-ink2",
}) {
  const [texto, setTexto] = useState(value ? String(value) : "");

  // Sincroniza quando o pai muda o valor
  useEffect(() => {
    const atual = texto === "" ? null : Number(texto);
    if (atual !== (value ?? null)) setTexto(value ? String(value) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(e) {
    let d = soDigitos(e.target.value).slice(0, 2);
    // "1" + "3" = 13 não existe: assume que o último dígito começa um novo número
    if (d.length === 2 && Number(d) > 12) d = d.slice(-1);
    if (d === "00") d = "0";
    setTexto(d);
    const n = Number(d);
    onChange?.(d !== "" && n >= 1 && n <= 12 ? n : null);
  }

  const n = Number(texto);
  const nome = n >= 1 && n <= 12 ? NOMES_MESES[n - 1] : "";

  return (
    <span className="inline-flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="Mês"
        aria-label="Mês (1 a 12)"
        value={texto}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        className={inputClassName}
      />
      <span aria-live="polite" className={nomeClassName}>{nome}</span>
    </span>
  );
}

/**
 * Ano digitável (4 dígitos). Apagar deixa o campo vazio (null), nunca 0,
 * e zeros à esquerda são removidos.
 */
export function AnoInput({
  value,
  onChange,
  inputClassName = "w-16 rounded border border-letra-border px-1 text-xs",
}) {
  const [texto, setTexto] = useState(value ? String(value) : "");

  useEffect(() => {
    const atual = texto === "" ? null : Number(texto);
    if (atual !== (value ?? null)) setTexto(value ? String(value) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(e) {
    const d = soDigitos(e.target.value).slice(0, 4).replace(/^0+/, "");
    setTexto(d);
    onChange?.(d === "" ? null : Number(d));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="Ano"
      aria-label="Ano"
      value={texto}
      onChange={handleChange}
      onFocus={(e) => e.target.select()}
      className={inputClassName}
    />
  );
}

/**
 * <MesAnoFields mes={mes} ano={ano} onMesChange={setMes} onAnoChange={setAno} />
 * Para outro tamanho (ex.: text-sm), passe mesClassName, nomeClassName e anoClassName.
 */
export default function MesAnoFields({
  mes, ano, onMesChange, onAnoChange,
  mesClassName, nomeClassName, anoClassName,
}) {
  return (
    <div className="inline-flex items-center gap-3">
      <MesInput value={mes} onChange={onMesChange} inputClassName={mesClassName} nomeClassName={nomeClassName} />
      <AnoInput value={ano} onChange={onAnoChange} inputClassName={anoClassName} />
    </div>
  );
}