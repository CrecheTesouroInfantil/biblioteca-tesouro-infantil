"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] =
    useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    verificarSessao();
  }, []);

  async function verificarSessao() {
    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();

    if (!session) {
      setErro(
        "Este link de recuperação é inválido ou expirou."
      );
    }

    setCarregando(false);
  }

  async function atualizarSenha(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (senha.length < 6) {
      setErro(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    setSalvando(true);

    const { error } =
      await supabaseBrowser.auth.updateUser({
        password: senha,
      });

    if (error) {
      console.log(error);

      setErro(
        "Não foi possível atualizar a senha."
      );

      setSalvando(false);
      return;
    }

    setSucesso(
      "Senha atualizada com sucesso! Você será redirecionado para o login."
    );

    await supabaseBrowser.auth.signOut();

    setTimeout(() => {
      router.replace("/login");
      router.refresh();
    }, 1800);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-blue-50 flex items-center justify-center p-4">

        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">

          <div className="text-5xl mb-4">
            🔐
          </div>

          <p className="text-gray-500 font-semibold">
            Verificando link de recuperação...
          </p>

        </div>

      </main>
    );
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
              className="w-24 h-24 object-contain mb-4"
            />

            <h1 className="text-3xl font-extrabold text-blue-700">
              Redefinir senha
            </h1>

            <p className="text-gray-500 mt-2">
              Biblioteca Tesouro Infantil
            </p>

          </div>

          {/* LINK INVÁLIDO */}

          {erro &&
            !senha &&
            !confirmarSenha && (
              <div className="space-y-5">

                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-semibold">
                  ❌ {erro}
                </div>

                <button
                  type="button"
                  onClick={() => router.replace("/login")}
                  className="
                    w-full
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    rounded-xl
                    py-4
                    font-bold
                    transition
                  "
                >
                  Voltar para o login
                </button>

              </div>
            )}

          {/* FORMULÁRIO */}

          {(!erro ||
            senha ||
            confirmarSenha) && (
            <form
              onSubmit={atualizarSenha}
              className="space-y-5"
            >

              {/* NOVA SENHA */}

              <div>

                <label className="block text-gray-700 font-semibold mb-2">
                  Nova senha
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
                    placeholder="Digite sua nova senha"
                    required
                    minLength={6}
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
                    "
                  >
                    {mostrarSenha
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

                <p className="text-xs text-gray-400 mt-1">
                  A senha deve ter pelo menos 6 caracteres.
                </p>

              </div>

              {/* CONFIRMAR SENHA */}

              <div>

                <label className="block text-gray-700 font-semibold mb-2">
                  Confirmar nova senha
                </label>

                <div className="relative">

                  <input
                    type={
                      mostrarConfirmacao
                        ? "text"
                        : "password"
                    }
                    value={confirmarSenha}
                    onChange={(e) =>
                      setConfirmarSenha(
                        e.target.value
                      )
                    }
                    placeholder="Digite novamente sua senha"
                    required
                    minLength={6}
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
                      setMostrarConfirmacao(
                        !mostrarConfirmacao
                      )
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
                    "
                  >
                    {mostrarConfirmacao
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

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

              {/* BOTÃO */}

              <button
                type="submit"
                disabled={salvando}
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
                {salvando
                  ? "Salvando..."
                  : "🔐 Atualizar senha"}
              </button>

              {/* VOLTAR */}

              <button
                type="button"
                onClick={() =>
                  router.replace("/login")
                }
                className="
                  w-full
                  text-gray-500
                  hover:text-blue-700
                  text-sm
                  font-semibold
                "
              >
                Voltar para o login
              </button>

            </form>
          )}

        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Biblioteca Tesouro Infantil
        </p>

      </div>

    </main>
  );
}