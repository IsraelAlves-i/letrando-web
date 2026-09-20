"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "../_components/Sidebar";

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}
function daquiA(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export default function AtribuirModulosPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState("");
  const [modulos, setModulos] = useState([]);
  const [selecionados, setSelecionados] = useState(new Set());
  const [dataInicio, setDataInicio] = useState(hojeISO());
  const [prazo, setPrazo] = useState(daquiA(15));
  const [obrigatorio, setObrigatorio] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [atribuicoesAtuais, setAtribuicoesAtuais] = useState([]);

  useEffect(() => {
    async function iniciar() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.replace("/login?perfil=professor");
        return;
      }

      const { data: turmasData } = await supabase
        .from("turma")
        .select("id, nome")
        .eq("professor_id", user.id)
        .order("created_at");

      const { data: modulosData } = await supabase
        .from("modulo")
        .select("id, nome, tipo, nivel:nivel_id(nome)")
        .order("created_at");

      setTurmas(turmasData ?? []);
      setModulos(modulosData ?? []);
      if (turmasData && turmasData.length > 0) setTurmaId(turmasData[0].id);
      setCarregando(false);
    }
    iniciar();
  }, [router]);

  useEffect(() => {
    async function carregarAtribuicoes() {
      if (!turmaId) return;
      const { data } = await supabase
        .from("atribuicao_modulo")
        .select("id, prazo, obrigatorio, modulo:modulo_id(nome)")
        .eq("turma_id", turmaId);
      setAtribuicoesAtuais(data ?? []);
    }
    carregarAtribuicoes();
  }, [turmaId, mensagem]);

  function alternarModulo(id) {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });
  }

  async function confirmarAtribuicao() {
    if (!turmaId || selecionados.size === 0) {
      setMensagem("Selecione ao menos um módulo.");
      return;
    }
    setSalvando(true);
    setMensagem("");

    const linhas = [...selecionados].map((modulo_id) => ({
      turma_id: turmaId,
      modulo_id,
      data_inicio: dataInicio,
      prazo,
      obrigatorio,
    }));

    const { error } = await supabase
      .from("atribuicao_modulo")
      .upsert(linhas, { onConflict: "turma_id,modulo_id" });

    setSalvando(false);

    if (error) {
      setMensagem("Não foi possível salvar a atribuição.");
      return;
    }

    setSelecionados(new Set());
    setMensagem("Módulos atribuídos com sucesso! ✓");
  }

  const totalQuestoesLabel = `${selecionados.size} módulo(s) selecionado(s)`;

  if (carregando) {
    return (
      <main className="flex min-h-screen bg-letra-bg">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-letra-ink2">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-letra-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-letra-border bg-white px-6 py-3.5">
          <h1 className="font-display text-lg font-extrabold text-letra-ink">Atribuir Módulos</h1>
          {turmas.length > 0 && (
            <select
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              className="badge-pill border-none bg-letra-indigoSoft text-letra-indigo outline-none"
            >
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {turmas.length === 0 ? (
            <div className="card p-8 text-center text-sm text-letra-ink2">
              Crie uma turma primeiro em &ldquo;Minhas Turmas&rdquo; para poder atribuir módulos.
            </div>
          ) : (
            <div className="flex gap-5">
              <div className="flex-1">
                <p className="mb-3 text-sm font-extrabold text-letra-ink">Selecione os módulos</p>
                {modulos.map((m) => {
                  const sel = selecionados.has(m.id);
                  const jaAtribuido = atribuicoesAtuais.some((a) => a.modulo?.nome === m.nome);
                  return (
                    <button
                      key={m.id}
                      onClick={() => alternarModulo(m.id)}
                      className={`mb-2 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                        sel ? "border-letra-indigo bg-letra-indigoSoft" : "border-letra-border bg-white hover:border-letra-indigo/50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold ${
                          sel ? "bg-letra-indigo text-white" : "border-2 border-letra-border"
                        }`}
                      >
                        {sel && "✓"}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-letra-indigo">{m.nome}</p>
                        <p className="text-xs text-letra-ink2">{m.nivel?.nome}</p>
                      </div>
                      {jaAtribuido && <span className="badge-pill bg-letra-mintSoft text-[#065F46]">Já atribuído</span>}
                    </button>
                  );
                })}
              </div>

              <div className="w-72 shrink-0">
                <div className="card p-5">
                  <p className="mb-4 text-sm font-extrabold text-letra-ink">⚙️ Configurar atribuição</p>

                  <label className="field-label">Módulos selecionados</label>
                  <div className="input-field mb-3.5 !bg-letra-indigoSoft font-semibold text-letra-indigo">
                    {totalQuestoesLabel}
                  </div>

                  <label className="field-label">Data de início</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="input-field mb-3.5"
                  />

                  <label className="field-label">Prazo de conclusão</label>
                  <input
                    type="date"
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    className="input-field mb-4 border-letra-rose text-letra-rose"
                  />

                  <label className="mb-4 flex items-center gap-2 rounded-lg bg-letra-goldSoft p-2.5 text-xs text-[#7A4F00]">
                    <input
                      type="checkbox"
                      checked={obrigatorio}
                      onChange={(e) => setObrigatorio(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Marcar como <strong>obrigatório</strong> para a turma
                  </label>

                  {mensagem && (
                    <p className={`mb-3 text-sm ${mensagem.includes("sucesso") ? "text-letra-mint" : "text-letra-rose"}`}>
                      {mensagem}
                    </p>
                  )}

                  <button
                    onClick={confirmarAtribuicao}
                    disabled={salvando}
                    className="btn-primary w-full !py-3 text-sm disabled:opacity-60"
                  >
                    {salvando ? "Salvando..." : "Confirmar atribuição"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
