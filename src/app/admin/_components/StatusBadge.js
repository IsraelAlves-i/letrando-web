import { rotuloStatus } from "@/lib/statusAssinatura";

// As classes ficam aqui (dentro de src/app) porque o Tailwind só escaneia essa pasta.
const classes = {
  pago: "bg-letra-mintSoft text-[#065F46]",
  vencido_30: "bg-letra-goldSoft text-[#7A4F00]",
  vencido_60: "bg-letra-roseSoft text-letra-rose",
  cancelado: "bg-letra-bg text-letra-ink3",
};

export default function StatusBadge({ status }) {
  return <span className={`badge-pill ${classes[status] ?? classes.pago}`}>{rotuloStatus(status)}</span>;
}
