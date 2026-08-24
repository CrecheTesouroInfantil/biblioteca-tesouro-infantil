"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [enviandoRecuperacao, setEnviandoRecuperacao] =
    useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setSucesso("");
    setCarregando(true);

    const { error } =
      await supabaseBrowser.auth.signInWithPassword({
        email,
        password: senha,
      });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function recuperarSenha() {
    setErro("");
    setSucesso("");

    if (!email.trim()) {
      setErro(
        "Digite seu e-mail antes de solicitar a recuperação da senha."
      );
      return;
    }

    setEnviandoRecuperacao(true);

    const { error } =
      await supabaseBrowser.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        }
      );

    if (error) {
      console.log(error);

      setErro(
        "Não foi possível enviar o e-mail de recuperação."
      );

      setEnviandoRecuperacao(false);
      return;
    }

    setSucesso(
      "Enviamos um link de recuperação para seu e-mail. Verifique sua caixa de entrada."
    );

    setEnviandoRecuperacao(false);
  }

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl shadow-xl p-8">

          {/* CABEÇALHO */}

          <div className="flex flex-col items-center text-center mb-8">

            <img
              src="/logo-creche.png"
              alt="Creche Tesouro Infantil"
              className="w-28 h-28 object-contain mb-4"
            />

            <h1 className="text-3xl font-extrabold text-blue-700">
              Área Administrativa
            </h1>

            <p className="text-gray-500 mt-2">
              Biblioteca Tesouro Infantil
            </p>

          </div>

          {/* FORMULÁRIO */}

          <form
            onSubmit={entrar}
            className="space-y-5"
          >

            {/* E-MAIL */}

            <div>

              <label className="block text-gray-700 font-semibold mb-2">
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Digite seu e-mail"
                required
                autoComplete="email"
                className="
                  w-full
                  border border-gray-300
                  rounded-xl
                  p-4
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                "
              />

            </div>

            {/* SENHA */}

            <div>

              <label className="block text-gray-700 font-semibold mb-2">
                Senha
              </label>

              <div className="relative">

                <input
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  value={senha}
                  onChange={(e) =>
                    setSenha(e.target.value)
                  }
                  placeholder="Digite sua senha"
                  required
                  autoComplete="current-password"
                  className="
                    w-full
                    border border-gray-300
                    rounded-xl
                    p-4
                    pr-14
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-blue-500
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarSenha(!mostrarSenha)
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    w-10
                    h-10
                    rounded-xl
                    text-gray-500
                    hover:bg-gray-100
                    transition
                  "
                  aria-label={
                    mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {mostrarSenha ? "🙈" : "👁️"}
                </button>

              </div>

            </div>

            {/* RECUPERAR SENHA */}

            <div className="flex justify-end">

              <button
                type="button"
                onClick={recuperarSenha}
                disabled={enviandoRecuperacao}
                className="
                  text-sm
                  font-bold
                  text-blue-600
                  hover:text-blue-800
                  disabled:text-gray-400
                  hover:underline
                "
              >
                {enviandoRecuperacao
                  ? "Enviando..."
                  : "Esqueci minha senha"}
              </button>

            </div>

            {/* ERRO */}

            {erro && (

              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm font-semibold">
                ❌ {erro}
              </div>

            )}

            {/* SUCESSO */}

            {sucesso && (

              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm font-semibold">
                ✅ {sucesso}
              </div>

            )}

            {/* ENTRAR */}

            <button
              type="submit"
              disabled={carregando}
              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-gray-400
                text-white
                rounded-xl
                py-4
                font-bold
                text-lg
                transition
              "
            >
              {carregando
                ? "Entrando..."
                : "🔐 Entrar"}
            </button>

          </form>

        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Biblioteca Tesouro Infantil
        </p>

      </div>

    </main>
  );
}