"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const XP_POR_ACERTO = 10;

export default function QuestaoPage() {
  return (
    <Suspense fallback={null}>
      <QuestaoFluxo />
    </Suspense>
  );
}

function QuestaoFluxo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const licaoId = searchParams.get("licao");

  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState("");
  const [licao, setLicao] = useState(null);
  const [modulo, setModulo] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState(null);
  const [respondida, setRespondida] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [vidas, setVidas] = useState(5);
  const [fase, setFase] = useState("respondendo"); // respondendo | concluido
  const [salvando, setSalvando] = useState(false);
  const [moduloCompletou, setModuloCompletou] = useState(false);
  const [proximaLicao, setProximaLicao] = useState(null);

  useEffect(() => {
    async function carregar() {
      if (!licaoId) {
        setErroCarga("Nenhuma lição selecionada.");
        setCarregando(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.replace("/login?perfil=aluno");
        return;
      }

      const { data: licaoData } = await supabase
        .from("licao")
        .select("id, ordem, nome, modulo:modulo_id(id, nome, icone, nivel:nivel_id(nome))")
        .eq("id", licaoId)
        .single();

      const { data: questoesData, error } = await supabase
        .from("questao")
        .select("id, enunciado, contexto, alternativa(id, texto, correta)")
        .eq("licao_id", licaoId)
        .order("created_at");

      if (error || !questoesData || questoesData.length === 0) {
        setErroCarga("Esta lição ainda não tem questões cadastradas.");
        setCarregando(false);
        return;
      }

      const preparadas = questoesData.map((q) => ({
        ...q,
        alternativa: [...q.alternativa].sort(() => Math.random() - 0.5),
      }));

      setLicao(licaoData);
      setModulo(licaoData?.modulo);
      setQuestoes(preparadas);
      setCarregando(false);
    }

    carregar();
  }, [licaoId, router]);

  const questaoAtual = questoes[indice];
  const progresso = questoes.length ? Math.round(((indice + 1) / questoes.length) * 100) : 0;

  function responder(alt) {
    if (respondida) return;
    setSelecionada(alt.id);
    setRespondida(true);
    if (alt.correta) {
      setAcertos((a) => a + 1);
    } else {
      setVidas((v) => Math.max(0, v - 1));
    }
  }

  async function continuar() {
    const proximo = indice + 1;
    if (proximo < questoes.length) {
      setIndice(proximo);
      setSelecionada(null);
      setRespondida(false);
      return;
    }
    await concluirLicao();
  }

  async function concluirLicao() {
    setSalvando(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    const pontuacaoObtida = Math.round((acertos / questoes.length) * 100);
    const xpGanho = acertos * XP_POR_ACERTO;

    if (user) {
      await supabase.from("progresso").upsert(
        {
          aluno_id: user.id,
          licao_id: licaoId,
          status: "concluido",
          pontuacao_obtida: pontuacaoObtida,
          data_conclusao: new Date().toISOString(),
        },
        { onConflict: "aluno_id,licao_id" }
      );

      const { data: alunoAtual } = await supabase
        .from("aluno")
        .select("pontuacao_total")
        .eq("id", user.id)
        .single();

      await supabase
        .from("aluno")
        .update({
          pontuacao_total: (alunoAtual?.pontuacao_total ?? 0) + xpGanho,
          ultimo_acesso: new Date().toISOString(),
        })
        .eq("id", user.id);

      // Verifica se essa era a última lição pendente do módulo
      if (modulo?.id) {
        const { data: todasLicoes } = await supabase
          .from("licao")
          .select("id, ordem")
          .eq("modulo_id", modulo.id)
          .order("ordem");

        const { data: progressoModulo } = await supabase
          .from("progresso")
          .select("licao_id, status")
          .eq("aluno_id", user.id)
          .in("licao_id", (todasLicoes ?? []).map((l) => l.id));

        const statusMap = new Map((progressoModulo ?? []).map((p) => [p.licao_id, p.status]));
        const todasConcluidas = (todasLicoes ?? []).every(
          (l) => l.id === licaoId || statusMap.get(l.id) === "concluido"
        );

        setModuloCompletou(todasConcluidas);

        if (!todasConcluidas) {
          const atual = (todasLicoes ?? []).find((l) => l.id === licaoId);
          const prox = (todasLicoes ?? []).find((l) => l.ordem === (atual?.ordem ?? 0) + 1);
          setProximaLicao(prox ?? null);
        }
      }
    }

    setSalvando(false);
    setFase("concluido");
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-letra-bg">
        <p className="text-sm text-letra-ink2">Carregando lição...</p>
      </main>
    );
  }

  if (erroCarga) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-letra-bg px-6 text-center">
        <p className="text-sm text-letra-rose">{erroCarga}</p>
        <Link href="/aluno/mapa" className="btn-primary">
          ← Voltar ao mapa
        </Link>
      </main>
    );
  }

  // ─── TELA DE CONCLUSÃO (lição ou módulo inteiro) ───────────
  if (fase === "concluido") {
    const taxaAcerto = Math.round((acertos / questoes.length) * 100);
    const xpGanho = acertos * XP_POR_ACERTO;

    if (moduloCompletou) {
      return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F1A35] via-[#1A2A5E] to-[#0F3D2A] px-6 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, #FFB300 0%, transparent 40%), radial-gradient(circle at 70% 80%, #00C48C 0%, transparent 40%)",
            }}
          />
          <div className="relative">
            <div className="mb-2 text-7xl drop-shadow-[0_0_24px_rgba(255,179,0,0.6)]">🏆</div>
            <div className="mb-5 flex justify-center gap-2">
              <span className="text-3xl">⭐</span>
              <span className="text-4xl">⭐</span>
              <span className="text-3xl">⭐</span>
            </div>
            <h1 className="mb-2 font-display text-4xl font-extrabold text-white">Módulo Concluído!</h1>
            <p className="mb-8 text-lg text-white/70">{modulo?.nome} — todas as lições completas</p>

            <div className="mb-9 flex justify-center gap-5">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-7 py-5">
                <p className="text-3xl font-extrabold text-letra-gold">+{xpGanho}</p>
                <p className="mt-1 text-xs text-white/60">XP nesta lição</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-7 py-5">
                <p className="text-3xl font-extrabold text-letra-mint">{taxaAcerto}%</p>
                <p className="mt-1 text-xs text-white/60">Taxa de acertos</p>
              </div>
            </div>

            <div className="flex justify-center gap-3.5">
              <Link
                href="/aluno/progresso"
                className="rounded-lg border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Ver ranking
              </Link>
              <Link
                href="/aluno/mapa"
                className="rounded-lg bg-white px-8 py-3.5 font-display text-sm font-extrabold text-letra-indigo transition hover:bg-white/90"
              >
                Voltar ao mapa →
              </Link>
            </div>
          </div>
        </main>
      );
    }

    // Lição concluída, mas módulo ainda não terminou
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-letra-mint to-letra-mintDark px-6 text-center text-white">
        <div className="text-6xl">⭐</div>
        <h1 className="font-display text-3xl font-extrabold">Lição Concluída!</h1>
        <p className="text-white/85">{licao?.nome} · {modulo?.nome}</p>
        <div className="flex gap-5">
          <div className="rounded-2xl border border-white/25 bg-white/15 px-6 py-4">
            <p className="text-2xl font-extrabold">+{xpGanho}</p>
            <p className="mt-1 text-xs text-white/75">XP ganhos</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/15 px-6 py-4">
            <p className="text-2xl font-extrabold">{taxaAcerto}%</p>
            <p className="mt-1 text-xs text-white/75">Taxa de acertos</p>
          </div>
        </div>
        <div className="flex gap-3.5">
          <Link
            href={`/aluno/modulo/${modulo?.id}`}
            className="rounded-lg border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            Ver trilha do módulo
          </Link>
          {proximaLicao && (
            <Link
              href={`/aluno/questao?licao=${proximaLicao.id}`}
              className="rounded-lg bg-white px-8 py-3.5 font-display text-sm font-extrabold text-letra-mintDark hover:bg-white/90"
            >
              Próxima lição →
            </Link>
          )}
        </div>
      </main>
    );
  }

  // ─── TELA DE QUESTÃO ────────────────────────────────────────
  const acertou = respondida && questaoAtual.alternativa.find((a) => a.id === selecionada)?.correta;
  const alternativaCorreta = questaoAtual.alternativa.find((a) => a.correta);

  return (
    <main className="flex min-h-screen flex-col bg-letra-bg">
      <div className="flex items-center gap-3.5 border-b border-letra-border bg-white px-7 py-3">
        <Link href={`/aluno/modulo/${modulo?.id ?? ""}`} className="flex h-7 w-7 items-center justify-center text-letra-ink2 hover:text-letra-ink">
          ✕
        </Link>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-letra-border">
          <div className="h-full rounded-full bg-letra-mint transition-all" style={{ width: `${progresso}%` }} />
        </div>
        <span className="whitespace-nowrap text-xs font-bold text-letra-ink2">
          {indice + 1} / {questoes.length}
        </span>
        <span className="text-base">{"❤️".repeat(vidas)}</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          <span className="badge-pill mb-4 bg-letra-indigoSoft uppercase tracking-wide text-letra-indigo">
            {licao?.nome ?? modulo?.nome ?? "Ortografia"}
          </span>

          <p className="mb-4 font-display text-xl font-extrabold leading-snug text-letra-ink">
            {questaoAtual.contexto ? "Qual a alternativa correta?" : questaoAtual.enunciado}
          </p>

          {questaoAtual.contexto && (
            <div className="card mb-6 rounded-r-xl rounded-l-none border-l-4 border-letra-indigo py-3.5 italic shadow-card">
              &ldquo;{questaoAtual.contexto}&rdquo;
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {questaoAtual.alternativa.map((alt, i) => {
              let estilo = "border-letra-border bg-white hover:border-letra-indigo hover:bg-letra-indigoSoft";
              let letraEstilo = "bg-letra-bg text-letra-ink2";
              if (respondida && alt.id === alternativaCorreta?.id) {
                estilo = "border-letra-mint bg-letra-mintSoft text-[#065F46]";
                letraEstilo = "bg-letra-mint text-white";
              } else if (respondida && alt.id === selecionada) {
                estilo = "border-letra-rose bg-letra-roseSoft text-[#9B1C2E]";
                letraEstilo = "bg-letra-rose text-white";
              }
              return (
                <button
                  key={alt.id}
                  onClick={() => responder(alt)}
                  disabled={respondida}
                  className={`flex items-center gap-3.5 rounded-xl border-2 px-4 py-3.5 text-left text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-letra-indigo/40 disabled:cursor-default ${estilo}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${letraEstilo}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {alt.texto}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {respondida && (
        <div
          className={`flex items-start justify-between gap-6 border-t-2 px-7 py-5 ${
            acertou ? "border-letra-mint bg-letra-mintSoft" : "border-letra-rose bg-letra-roseSoft"
          }`}
        >
          <div className="flex-1">
            <p className={`mb-1.5 font-display text-lg font-extrabold ${acertou ? "text-[#065F46]" : "text-[#9B1C2E]"}`}>
              {acertou ? "✓ Correto! Muito bem!" : "✗ Incorreto — mas você vai aprender!"}
            </p>
            {acertou && (
              <span className="badge-pill mb-2.5 bg-letra-goldSoft text-[#7A4F00]">
                ⭐ +{XP_POR_ACERTO} XP conquistados
              </span>
            )}
          </div>
          <button
            onClick={continuar}
            disabled={salvando}
            className={`whitespace-nowrap rounded-lg px-7 py-3.5 font-display text-sm font-bold text-white shadow-md transition disabled:opacity-60 ${
              acertou ? "bg-letra-mint hover:bg-letra-mintDark" : "bg-letra-rose hover:bg-[#e63e4d]"
            }`}
          >
            {salvando ? "Salvando..." : indice + 1 < questoes.length ? "Continuar →" : "Finalizar lição →"}
          </button>
        </div>
      )}
    </main>
  );
}
