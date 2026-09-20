"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { login, supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const perfil = searchParams.get("perfil") === "professor" ? "professor" : "aluno";
  const ehProfessor = perfil === "professor";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { error } = await login({ email, senha });

    if (error) {
      setCarregando(false);
      setErro("E-mail ou senha inválidos. Verifique e tente novamente.");
      return;
    }

    // Descobre quem logou e se é admin — admin entra por QUALQUER tela de login,
    // independente de estar em /login?perfil=aluno ou /login?perfil=professor.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: admin } = await supabase
        .from("admin")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (admin) {
        setCarregando(false);
        router.push("/admin/financeiro");
        return;
      }
    }

    setCarregando(false);
    router.push(ehProfessor ? "/professor/dashboard" : "/aluno/mapa");
  }

  // Aluno = gradiente índigo · Professor = gradiente verde (mint)
  const fundo = ehProfessor
    ? "bg-gradient-to-br from-[#0F1F0F] via-[#0F2D1A] to-[#0A4A2A]"
    : "bg-gradient-to-br from-letra-navy via-[#2D3B6B] to-letra-indigo";

  const corBotao = ehProfessor
    ? "bg-letra-mint hover:bg-letra-mintDark"
    : "bg-white text-letra-indigo hover:bg-white/90";

  return (
    <main className={`flex min-h-screen items-center justify-center px-6 ${fundo}`}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-9 backdrop-blur-xl"
      >
        <div className="mb-7 text-center">
          <div className="mb-2 text-3xl">{ehProfessor ? "👩‍🏫" : "📘"}</div>
          <h1 className="font-display text-2xl font-extrabold text-white">
            {ehProfessor ? "Portal do Professor" : "Letrando"}
          </h1>
          <p className="mt-1.5 text-xs text-white/60">
            {ehProfessor ? "Letrando · Gestão de turmas" : "Acesso do Aluno"}
          </p>
        </div>

        <label className="field-label !text-white/60">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/50"
          placeholder="seuemail@escola.com"
        />

        <label className="field-label !text-white/60">Senha</label>
        <input
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mb-5 w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/50"
          placeholder="••••••••"
        />

        {erro && <p className="mb-4 text-sm text-[#FF8A93]">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className={`w-full rounded-lg px-6 py-3.5 font-display text-sm font-bold shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 ${corBotao} ${
            ehProfessor ? "text-white" : ""
          }`}
        >
          {carregando ? "Entrando..." : ehProfessor ? "Entrar no painel →" : "Entrar →"}
        </button>

        <p className="mt-5 text-center text-sm text-white/55">
          {ehProfessor ? "Primeira vez?" : "Não tem conta?"}{" "}
          <Link
            href={ehProfessor ? "/cadastro/professor" : "/cadastro/aluno"}
            className="font-semibold text-white underline underline-offset-2"
          >
            {ehProfessor ? "Criar conta com código da escola" : "Cadastrar com código da turma"}
          </Link>
        </p>

        <div className="mt-6 border-t border-white/10 pt-5 text-center">
          <Link href="/" className="text-xs text-white/40 hover:text-white/60">
            ← Voltar à tela inicial
          </Link>
        </div>
      </form>
    </main>
  );
}