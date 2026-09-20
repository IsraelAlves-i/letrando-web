"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const itens = [
  { icone: "📊", nome: "Dashboard", href: "/professor/dashboard" },
  { icone: "👥", nome: "Minhas Turmas", href: "/professor/turmas" },
  { icone: "📚", nome: "Atribuir Módulos", href: "/professor/atribuir" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="flex w-52 shrink-0 flex-col bg-letra-navy">
      <div className="border-b border-white/10 px-4 py-4">
        <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-letra-indigo text-sm">📘</span>
          Letrando
        </h2>
        <p className="mt-0.5 pl-9 text-[11px] text-white/40">Portal do Professor</p>
      </div>
      <nav className="flex-1 py-2">
        {itens.map((item) => {
          const ativo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 border-r-[3px] px-4 py-2.5 text-sm font-semibold transition ${
                ativo ? "border-letra-indigo bg-letra-indigo/20 text-white" : "border-transparent text-white/55 hover:text-white/80"
              }`}
            >
              <span className="w-4 text-center text-sm">{item.icone}</span>
              {item.nome}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 py-2">
        <button
          onClick={sair}
          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-white/55 hover:text-white/80"
        >
          <span className="w-4 text-center text-sm">🚪</span>
          Sair
        </button>
      </div>
    </aside>
  );
}
