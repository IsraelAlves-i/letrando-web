"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpProfessor } from "@/lib/supabaseClient";

export default function CadastroProfessorPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", codigoEscola: "" });
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
    const { error } = await signUpProfessor(form);
    setCarregando(false);

    if (error) {
      setErro(error.message || "Não foi possível criar a conta. Tente novamente.");
      return;
    }

    router.push("/professor/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-letra-bg px-6 py-14">
      <div className="flex w-full max-w-4xl items-center gap-14">
        {/* Coluna esquerda — apresentação */}
        <div className="hidden flex-1 lg:block">
          <div className="mb-4 text-4xl">👩‍🏫</div>
          <h1 className="mb-3 font-display text-3xl font-extrabold leading-tight text-letra-ink">
            Cadastro de
            <br />
            Professor
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-letra-ink2">
            Crie sua conta para acessar o painel de gestão de turmas, atribuir
            módulos e acompanhar o desempenho dos alunos.
          </p>
          <div className="rounded-xl border border-letra-gold/30 bg-letra-goldSoft p-4 text-sm leading-relaxed text-[#7A4F00]">
            <p className="mb-1 font-bold">📋 Você vai precisar de:</p>
            <p>
              • <strong>Código da escola</strong> — fornecido pela coordenação ou
              secretaria da sua escola
            </p>
            <p className="mt-0.5">
              • Esse código confirma que sua escola possui uma{" "}
              <strong>assinatura ativa</strong> no Letrando
            </p>
          </div>
        </div>

        {/* Coluna direita — formulário */}
        <form onSubmit={handleSubmit} className="card w-full max-w-sm shrink-0 border-letra-mint/20">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-letra-mintSoft text-base">
              📘
            </div>
            <span className="font-display text-base font-extrabold text-letra-mintDark">
              Letrando
            </span>
            <span className="ml-1 text-xs text-letra-ink2">· Professor</span>
          </div>

          <label className="field-label">Nome completo</label>
          <input
            required
            value={form.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
            className="input-field mb-4"
          />

          <label className="field-label">E-mail institucional</label>
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
            Código da escola <span className="text-letra-mintDark">(fornecido pela coordenação)</span>
          </label>
          <input
            required
            value={form.codigoEscola}
            onChange={(e) => handleChange("codigoEscola", e.target.value.toUpperCase())}
            placeholder="EX: ESC-2026-ALFA"
            className="input-field mb-5 border-letra-mint bg-letra-mintSoft font-mono font-bold uppercase tracking-wide text-letra-mintDark"
          />

          {erro && <p className="mb-4 text-sm text-letra-rose">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-letra-mint px-6 py-3 font-display font-semibold text-white shadow-card transition hover:bg-letra-mintDark hover:shadow-cardHover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Criando conta..." : "Criar conta de professor →"}
          </button>

          <p className="mt-4 text-center text-sm text-letra-ink2">
            Já tem conta?{" "}
            <Link href="/login?perfil=professor" className="font-semibold text-letra-mintDark underline">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
