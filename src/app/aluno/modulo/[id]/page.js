"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function TrilhaLicoesPage() {
  const router = useRouter();
  const params = useParams();
  const moduloId = params.id;

  const [carregando, setCarregando] = useState(true);
  const [modulo, setModulo] = useState(null);
  const [licoes, setLicoes] = useState([]);

  useEffect(() => {
    async function carregar() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/login?perfil=aluno");
        return;
      }

      const { data: moduloData } = await supabase
        .from("modulo")
        .select("id, nome, icone, nivel:nivel_id(nome)")
        .eq("id", moduloId)
        .single();

      const { data: licoesData } = await supabase
        .from("licao")
        .select("id, ordem, nome")
        .eq("modulo_id", moduloId)
        .order("ordem");

      const { data: progresso } = await supabase
        .from("progresso")
        .select("licao_id, status")
        .eq("aluno_id", user.id)
        .in("licao_id", (licoesData ?? []).map((l) => l.id));

      const statusPorLicao = new Map((progresso ?? []).map((p) => [p.licao_id, p.status]));

      let desbloqueado = true;
      const licoesComStatus = (licoesData ?? []).map((l) => {
        const salvo = statusPorLicao.get(l.id);
        let status;
        if (salvo === "concluido") {
          status = "concluido";
        } else if (desbloqueado) {
          status = "atual";
          desbloqueado = false;
        } else {
          status = "bloqueada";
        }
        return { ...l, status };
      });

      setModulo(moduloData);
      setLicoes(licoesComStatus);
      setCarregando(false);
    }
    carregar();
  }, [moduloId, router]);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-letra-bg">
        <p className="text-sm text-letra-ink2">Carregando...</p>
      </main>
    );
  }

  const concluidas = licoes.filter((l) => l.status === "concluido").length;
  const progressoPct = licoes.length ? Math.round((concluidas / licoes.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-letra-bg">
      <div className="bg-gradient-to-r from-letra-mint to-letra-mintDark px-7 py-5 text-white">
        <Link href="/aluno/mapa" className="mb-1.5 inline-block text-xs text-white/80 hover:text-white">
          ← Voltar ao mapa principal
        </Link>
        <h1 className="flex items-center gap-2.5 font-display text-xl font-extrabold">
          <span>{modulo?.icone}</span> {modulo?.nome}
        </h1>
        <p className="mt-0.5 text-xs text-white/80">{modulo?.nivel?.nome}</p>
        <div className="mt-2.5 h-2 w-72 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: `${progressoPct}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] text-white/80">
          {concluidas} de {licoes.length} lições concluídas
          {concluidas === licoes.length && licoes.length > 0 && " — módulo completo! 🎉"}
        </p>
      </div>

      <div className="flex flex-col items-center px-6 py-8 pb-16">
        {licoes.map((l, i) => {
          const clicavel = l.status !== "bloqueada";
          const isUltima = i === licoes.length - 1;
          const offset = i % 3 === 1 ? "ml-[-70px]" : i % 3 === 2 ? "ml-[70px]" : "";

          const circulo = (
            <div className="flex flex-col items-center">
              <div
                className={`flex h-15 w-15 items-center justify-center rounded-full border-4 border-white text-xl font-extrabold text-white shadow-[0_4px_0_rgba(0,0,0,0.18)] ${
                  l.status === "concluido"
                    ? "bg-letra-mint"
                    : l.status === "atual"
                    ? "!shadow-[0_6px_18px_rgba(61,90,254,0.5)] bg-letra-indigo"
                    : "bg-letra-ink3 !shadow-none"
                }`}
                style={{ width: 60, height: 60 }}
              >
                {l.status === "bloqueada" ? "🔒" : isUltima && l.status !== "bloqueada" ? "🏆" : l.ordem}
              </div>
              <p className={`mt-1.5 text-[11px] font-bold ${l.status === "atual" ? "text-letra-indigo" : l.status === "bloqueada" ? "text-letra-ink3" : "text-letra-ink"}`}>
                {isUltima ? `Lição ${l.ordem} · Final` : `Lição ${l.ordem}`}
                {l.status === "atual" && " · agora"}
              </p>
            </div>
          );

          return (
            <div key={l.id} className="flex flex-col items-center">
              {i > 0 && (
                <div className={`my-0.5 w-1 ${licoes[i - 1].status === "concluido" ? "bg-letra-mint" : "bg-letra-border"}`} style={{ height: 22 }} />
              )}
              <div className={offset}>
                {clicavel ? (
                  <Link href={`/aluno/questao?licao=${l.id}`}>{circulo}</Link>
                ) : (
                  <div className="cursor-not-allowed opacity-70">{circulo}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
