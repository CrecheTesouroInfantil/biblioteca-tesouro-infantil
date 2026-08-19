"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
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

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl shadow-xl p-8">

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

          <form
            onSubmit={entrar}
            className="space-y-5"
          >

            <div>

              <label className="block text-gray-700 font-semibold mb-2">
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
                className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            <div>

              <label className="block text-gray-700 font-semibold mb-2">
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {erro && (

              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm font-semibold">
                ❌ {erro}
              </div>

            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl py-4 font-bold text-lg transition"
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