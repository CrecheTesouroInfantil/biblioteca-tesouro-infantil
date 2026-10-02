"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseSistema } from "@/lib/supabaseSistema";

export default function SistemaLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();

    setErro("");
    setEntrando(true);

    console.log("1. Iniciando login da Secretaria...");
    console.log("2. E-mail:", email.trim());

    try {
      const loginPromise = supabaseSistema.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "O Supabase não respondeu dentro de 10 segundos."
            )
          );
        }, 10000);
      });

      console.log("3. Aguardando resposta do Supabase...");

      const { data, error } = await Promise.race([
        loginPromise,
        timeoutPromise,
      ]);

      console.log("4. Resposta recebida:", { data, error });

      if (error) {
        console.error("Erro no login da Secretaria:", error);

        setErro(
          error.message ||
            "E-mail ou senha incorretos."
        );

        setEntrando(false);
        return;
      }

      console.log("5. Login realizado com sucesso!");
      console.log("Usuário:", data.user?.email);

      router.replace("/sistema");
      router.refresh();

    } catch (error) {
      console.error("ERRO NO LOGIN DA SECRETARIA:", error);

      if (
        error instanceof Error &&
        error.message.includes("10 segundos")
      ) {
        setErro(
          "O servidor da Secretaria não respondeu. Vamos verificar a conexão com o Supabase."
        );
      } else if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro(
          "Não foi possível entrar no sistema. Tente novamente."
        );
      }

      setEntrando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-8 py-10 text-center text-white">
            <img
              src="/logo-creche.png"
              alt="Creche Tesouro Infantil"
              className="w-24 h-24 mx-auto object-contain mb-5"
            />

            <h1 className="text-2xl font-extrabold">
              Creche Tesouro Infantil
            </h1>

            <p className="mt-2 text-sm text-blue-100">
              Sistema de Gestão
            </p>
          </div>

          <form onSubmit={entrar} className="p-8">

            <h2 className="text-2xl font-extrabold text-slate-800">
              Entrar
            </h2>

            <p className="text-sm text-slate-400 mt-1 mb-6">
              Acesse o sistema administrativo da creche.
            </p>

            {erro && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-700">
                ❌ {erro}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
                disabled={entrando}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                disabled={entrando}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={entrando}
              className="w-full rounded-xl bg-blue-600 text-white px-5 py-3.5 font-extrabold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {entrando
                ? "Entrando..."
                : "🔐 Entrar no sistema"}
            </button>

            <p className="text-center text-xs text-slate-400 mt-6">
              Sistema Tesouro Infantil • 2026
            </p>

          </form>
        </div>
      </div>
    </main>
  );
}