"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpAluno } from "@/lib/supabaseClient";

const beneficios = [
  "Trilha de módulos por nível escolar",
  "Feedback imediato com explicação gramatical",
  "Ranking da turma em tempo real",
];

export default function CadastroAlunoPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", codigoTurma: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (form.senha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    setCarregando(true);
    const { error } = await signUpAluno(form);
    setCarregando(false);

    if (error) {
      setErro(error.message || "Não foi possível criar a conta. Tente novamente.");
      return;
    }

    router.push("/aluno/mapa");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-letra-bg px-6 py-14">
      <div className="flex w-full max-w-4xl items-center gap-14">
        {/* Coluna esquerda — apresentação */}
        <div className="hidden flex-1 lg:block">
          <div className="mb-4 text-4xl">📘</div>
          <h1 className="mb-3 font-display text-3xl font-extrabold leading-tight text-letra-ink">
            Bem-vindo ao
            <br />
            Letrando!
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-letra-ink2">
            Pratique ortografia de forma gamificada, suba de nível e dispute o
            ranking da sua turma.
          </p>
          <ul className="flex flex-col gap-2.5">
            {beneficios.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-letra-ink2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-letra-mintSoft text-xs font-bold text-letra-mint">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna direita — formulário */}
        <form onSubmit={handleSubmit} className="card w-full max-w-sm shrink-0">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-letra-indigoSoft text-base">
              📘
            </div>
            <span className="font-display text-base font-extrabold text-letra-indigo">
              Letrando
            </span>
          </div>

          <h2 className="mb-0.5 text-lg font-bold text-letra-ink">Criar sua conta</h2>
          <p className="mb-5 text-xs text-letra-ink2">
            Perfil: Aluno · Ensino Fundamental / Médio
          </p>

          <label className="field-label">Nome completo</label>
          <input
            required
            value={form.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            className="input-field mb-4"
          />

          <label className="field-label">E-mail</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="input-field mb-4"
          />

          <label className="field-label">Senha</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.senha}
            onChange={(e) => handleChange("senha", e.target.value)}
            className="input-field mb-4"
          />

          <label className="field-label">
            Código da turma <span className="text-letra-indigo">(fornecido pelo professor)</span>
          </label>
          <input
            required
            value={form.codigoTurma}
            onChange={(e) => handleChange("codigoTurma", e.target.value.toUpperCase())}
            placeholder="EX: LTR-8A2X"
            className="input-field mb-5 border-letra-indigo bg-letra-indigoSoft font-mono font-bold uppercase tracking-wide text-letra-indigo"
          />

          {erro && <p className="mb-4 text-sm text-letra-rose">{erro}</p>}

          <button type="submit" disabled={carregando} className="btn-primary w-full">
            {carregando ? "Criando conta..." : "Criar conta →"}
          </button>

          <p className="mt-4 text-center text-sm text-letra-ink2">
            Já tem conta?{" "}
            <Link href="/login?perfil=aluno" className="font-semibold text-letra-indigo underline">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
