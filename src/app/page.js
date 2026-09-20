import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-9 bg-gradient-to-br from-letra-navy via-[#2D3B6B] to-letra-indigo px-6 py-16">
      <div className="text-center">
        <div className="mb-3 text-5xl">📘</div>
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-white">
          Letr<span className="text-letra-gold">a</span>ndo
        </h1>
        <p className="mt-3 text-base text-white/65">
          Gamificação para ortografia da língua portuguesa nas escolas
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/login?perfil=aluno"
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-8 text-center text-white transition hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl"
        >
          <span className="text-4xl">🎓</span>
          <span className="font-display text-lg font-extrabold">Sou Aluno</span>
          <span className="text-xs leading-relaxed text-white/75">
            Pratique ortografia e suba no ranking da turma
          </span>
        </Link>

        <Link
          href="/login?perfil=professor"
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-8 text-center text-white transition hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl"
        >
          <span className="text-4xl">👩‍🏫</span>
          <span className="font-display text-lg font-extrabold">Sou Professor</span>
          <span className="text-xs leading-relaxed text-white/75">
            Gerencie turmas e acompanhe o progresso
          </span>
        </Link>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {["🏫 Para escolas", "🎮 Gamificado", "🌐 Acesso pelo navegador", "🇧🇷 Alinhado à BNCC"].map(
          (badge) => (
            <span
              key={badge}
              className="badge-pill border border-white/20 bg-white/10 text-white/75"
            >
              {badge}
            </span>
          )
        )}
      </div>
    </main>
  );
}
