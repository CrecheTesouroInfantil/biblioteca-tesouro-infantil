"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HomeDashboard from "@/components/HomeDashboard";

export default function AdminPage() {
  const [totalLivros, setTotalLivros] = useState(0);
  const [totalExemplares, setTotalExemplares] = useState(0);
  const [emprestados, setEmprestados] = useState(0);
  const [devolvidos, setDevolvidos] = useState(0);
  const [reservas, setReservas] = useState(0);
  const [atrasados, setAtrasados] = useState(0);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    const [
      resultadoLivros,
      resultadoEmprestimos,
      resultadoDevolvidos,
      resultadoReservas,
      resultadoAtrasados,
    ] = await Promise.all([
      supabase
        .from("livros")
        .select("quantidade"),

      supabase
        .from("emprestimos")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("devolvido", false),

      supabase
        .from("emprestimos")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("devolvido", true),

      supabase
        .from("reservas")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("atendida", false),

      supabase
        .from("emprestimos")
        .select("id")
        .eq("devolvido", false)
        .lt(
          "data_prevista",
          new Date().toISOString().split("T")[0]
        ),
    ]);

    const livros = resultadoLivros.data || [];

    const quantidadeExemplares = livros.reduce(
      (total, livro) =>
        total + (livro.quantidade ?? 0),
      0
    );

    setTotalLivros(livros.length);
    setTotalExemplares(quantidadeExemplares);
    setEmprestados(resultadoEmprestimos.count ?? 0);
    setDevolvidos(resultadoDevolvidos.count ?? 0);
    setReservas(resultadoReservas.count ?? 0);
    setAtrasados(
      resultadoAtrasados.data?.length ?? 0
    );
  }

  const disponiveis = Math.max(
    totalExemplares - emprestados,
    0
  );

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            🔐 Administração
          </h1>

          <p className="text-gray-500 mt-2">
            Painel administrativo da Biblioteca Tesouro Infantil
          </p>

        </div>

        <HomeDashboard
          totalLivros={totalLivros}
          totalExemplares={totalExemplares}
          disponiveis={disponiveis}
          emprestados={emprestados}
          devolvidos={devolvidos}
          reservas={reservas}
          atrasados={atrasados}
        />

        <div className="mt-8 bg-white rounded-3xl shadow-lg p-6">

          <h2 className="text-2xl font-bold text-blue-700 mb-5">
            🚀 Acesso rápido
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <Link
              href="/biblioteca"
              className="bg-blue-50 hover:bg-blue-100 rounded-2xl p-5 transition"
            >
              <div className="text-3xl mb-2">
                📚
              </div>

              <p className="font-bold text-blue-700">
                Biblioteca
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Consultar o acervo
              </p>
            </Link>

            <Link
              href="/cadastro"
              className="bg-green-50 hover:bg-green-100 rounded-2xl p-5 transition"
            >
              <div className="text-3xl mb-2">
                ➕
              </div>

              <p className="font-bold text-green-700">
                Novo Livro
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Cadastrar um livro
              </p>
            </Link>

            <Link
              href="/emprestimos"
              className="bg-orange-50 hover:bg-orange-100 rounded-2xl p-5 transition"
            >
              <div className="text-3xl mb-2">
                📤
              </div>

              <p className="font-bold text-orange-700">
                Empréstimos
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Ver livros emprestados
              </p>
            </Link>

            <Link
              href="/reservas"
              className="bg-purple-50 hover:bg-purple-100 rounded-2xl p-5 transition"
            >
              <div className="text-3xl mb-2">
                📌
              </div>

              <p className="font-bold text-purple-700">
                Reservas
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Ver reservas pendentes
              </p>
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}