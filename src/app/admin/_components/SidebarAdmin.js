"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { icone: "🏫", nome: "Escolas", href: "/admin/escolas" },
  { icone: "💵", nome: "Financeiro", href: "/admin/financeiro" },
  { icone: "🧾", nome: "Fiscal", href: "/admin/fiscal" },
  { icone: "📒", nome: "Contabilidade", href: "/admin/contabilidade" },
];

export default function SidebarAdmin() {
  const pathname = usePathname();
  return (
    <aside className="flex w-52 shrink-0 flex-col bg-[#0F0B1F]">
      <div className="border-b border-white/10 px-4 py-4">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-extrabold text-white">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-letra-lilac text-xs">
            🔧
          </span>
          Letrando
        </h2>
        <p className="mt-0.5 pl-8 text-[10px] text-white/40">Painel Admin</p>
      </div>
      <nav className="flex-1 py-2">
        {itens.map((item) => {
          const ativo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 border-r-[3px] px-4 py-2.5 text-sm font-semibold transition ${
                ativo ? "border-letra-lilac bg-letra-lilac/25 text-white" : "border-transparent text-white/45 hover:text-white/70"
              }`}
            >
              <span className="w-4 text-center text-sm">{item.icone}</span>
              {item.nome}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-[10px] leading-relaxed text-white/30">
          🔒 Acesso interno — protótipo visual. Requer backend seguro com service_role key para produção.
        </p>
      </div>
    </aside>
  );
}
