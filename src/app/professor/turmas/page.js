"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "../_components/Sidebar";

const cores = ["bg-letra-indigoSoft", "bg-letra-mintSoft", "bg-letra-goldSoft", "bg-letra-lilacSoft"];

function gerarCodigo(nome) {
  const prefixo = nome
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();
  const sufixo = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LTR-${prefixo || "TRM"}${sufixo}`;
}

export default function GestaoTurmasPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [professorId, setProfessorId] = useState(null);
  const [escolaId, setEscolaId] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaSerie, setNovaSerie] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(null);

  async function carregarTurmas(pid) {
    const { data } = await supabase
      .from("turma")
      .select("id, nome, serie, codigo_acesso, aluno(id)")
      .eq("professor_id", pid)
      .order("created_at");
    setTurmas(data ?? []);
    setCarregando(false);
  }

  useEffect(() => {
    async function iniciar() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/login?perfil=professor");
        return;
      }
      const { data: prof } = await supabase.from("professor").select("id, escola_id").eq("id", user.id).single();
      if (!prof) {
        router.replace("/login?perfil=professor");
        return;
      }
      setProfessorId(prof.id);
      setEscolaId(prof.escola_id);
      await carregarTurmas(prof.id);
    }
    iniciar();
  }, [router]);

  async function criarTurma(e) {
    e.preventDefault();
    setErro("");
    if (!novoNome.trim() || !novaSerie.trim()) {
      setErro("Preencha o nome e a série da turma.");
      return;
    }

    setSalvando(true);
    const codigo = gerarCodigo(novoNome);

    const { error } = await supabase.from("turma").insert({
      nome: novoNome.trim(),
      serie: novaSerie.trim(),
      codigo_acesso: codigo,
      professor_id: professorId,
      escola_id: escolaId,
    });
    setSalvando(false);

    if (error) {
      setErro("Não foi possível criar a turma. Tente novamente.");
      return;
    }

    setNovoNome("");
    setNovaSerie("");
    setCriando(false);
    await carregarTurmas(professorId);
  }

  function copiarCodigo(codigo) {
    navigator.clipboard?.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 1500);
  }

  return (
    <main className="flex min-h-screen bg-letra-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-letra-border bg-white px-6 py-3.5">
          <div>
            <h1 className="font-display text-lg font-extrabold text-letra-ink">Minhas Turmas</h1>
            <p className="text-xs text-letra-ink2">Gerencie turmas e distribua módulos de ortografia</p>
          </div>
          <button onClick={() => setCriando((v) => !v)} className="btn-primary !px-5 !py-2.5 text-sm">
            {criando ? "Cancelar" : "+ Nova Turma"}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {criando && (
            <form onSubmit={criarTurma} className="card mb-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Nome da turma</label>
                  <input
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: 8A – Língua Portuguesa"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="field-label">Série</label>
                  <input
                    value={novaSerie}
                    onChange={(e) => setNovaSerie(e.target.value)}
                    placeholder="Ex: 8º ano"
                    className="input-field"
                  />
                </div>
              </div>
              {erro && <p className="mt-3 text-sm text-letra-rose">{erro}</p>}
              <button type="submit" disabled={salvando} className="btn-primary mt-4 !px-5 !py-2.5 text-sm">
                {salvando ? "Criando..." : "Criar turma"}
              </button>
            </form>
          )}

          {carregando ? (
            <p className="text-sm text-letra-ink2">Carregando turmas...</p>
          ) : turmas.length === 0 ? (
            <div className="card p-8 text-center text-sm text-letra-ink2">
              Você ainda não criou nenhuma turma. Clique em &ldquo;+ Nova Turma&rdquo; para começar.
            </div>
          ) : (
            turmas.map((t, i) => (
              <div key={t.id} className="tcard card mb-3.5 flex items-center gap-4 !p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${cores[i % cores.length]}`}>
                  📚
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold text-letra-ink">{t.nome}</h3>
                  <p className="text-xs text-letra-ink2">
                    {t.serie} · {t.aluno?.length ?? 0} aluno(s)
                  </p>
                </div>
                <div className="text-center">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-letra-ink2">
                    Código de acesso
                  </p>
                  <button
                    onClick={() => copiarCodigo(t.codigo_acesso)}
                    className="rounded-lg border-[1.5px] border-dashed border-letra-border bg-letra-bg px-3.5 py-1.5 font-mono text-xs font-extrabold tracking-wide text-letra-ink hover:border-letra-indigo"
                  >
                    {copiado === t.codigo_acesso ? "Copiado ✓" : t.codigo_acesso}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
