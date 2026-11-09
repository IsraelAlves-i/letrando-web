// Status da assinatura de cada município (quem paga o Letrando).
// Fica aqui (sem classes de cor) pra ser usado tanto no formulário quanto nas telas.
export const STATUS_ASSINATURA = [
  { valor: "pago", rotulo: "Pago" },
  { valor: "vencido_30", rotulo: "Vencido — 30 dias de atraso" },
  { valor: "vencido_60", rotulo: "Vencido — 60 dias de atraso" },
  { valor: "cancelado", rotulo: "Cancelado" },
];

export function rotuloStatus(valor) {
  return STATUS_ASSINATURA.find((s) => s.valor === valor)?.rotulo ?? valor;
}
