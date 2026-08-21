"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HomeDashboard from "@/components/HomeDashboard";

export default function Home() {
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

    const totalEmprestados =
      resultadoEmprestimos.count ?? 0;

    setTotalLivros(livros.length);
    setTotalExemplares(quantidadeExemplares);
    setEmprestados(totalEmprestados);

    setDevolvidos(
      resultadoDevolvidos.count ?? 0
    );

    setReservas(
      resultadoReservas.count ?? 0
    );

    setAtrasados(
      resultadoAtrasados.data?.length ?? 0
    );
  }

  const disponiveis = Math.max(
    totalExemplares - emprestados,
    0
  );

  return (
    <main className="min-h-screen bg-[#eef5ff] p-4 md:p-8">

      <div className="max-w-7xl mx-auto space-y-7">

        {/* CABEÇALHO PRINCIPAL */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            bg-gradient-to-br
            from-[#1748d1]
            via-[#2457dc]
            to-[#12358f]
            text-white
            shadow-xl
          "
        >

          {/* DECORAÇÕES */}

          <div
            className="
              absolute
              -right-20
              -top-24
              w-72
              h-72
              rounded-full
              bg-white/10
            "
          />

          <div
            className="
              absolute
              -right-10
              -bottom-32
              w-64
              h-64
              rounded-full
              bg-white/5
            "
          />

          <div className="relative p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

              {/* TEXTO */}

              <div className="max-w-2xl">

                <div className="flex items-center gap-3 mb-5">

                  <div
                    className="
                      w-14 h-14
                      rounded-2xl
                      bg-white
                      flex items-center justify-center
                      shadow-lg
                    "
                  >
                    <img
                      src="/logo-creche.png"
                      alt="Creche Tesouro Infantil"
                      className="w-11 h-11 object-contain"
                    />
                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-[0.18em] font-bold text-blue-100">
                      Sistema de gestão
                    </p>

                    <p className="font-bold text-white">
                      Tesouro Infantil
                    </p>

                  </div>

                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  Biblioteca
                  <span className="block text-blue-100">
                    Tesouro Infantil
                  </span>
                </h1>

                <p className="text-blue-100 text-sm sm:text-base lg:text-lg mt-4 max-w-xl leading-relaxed">
                  Organize o acervo, acompanhe os empréstimos
                  e encontre os livros da nossa biblioteca
                  de forma simples e rápida.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-7">

                  <Link
                    href="/biblioteca"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      bg-white
                      text-blue-700
                      px-5 py-3
                      rounded-xl
                      font-extrabold
                      shadow-lg
                      hover:bg-blue-50
                      transition
                    "
                  >
                    📚 Consultar biblioteca
                  </Link>

                  <Link
                    href="/cadastro"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      bg-white/10
                      border border-white/20
                      text-white
                      px-5 py-3
                      rounded-xl
                      font-bold
                      hover:bg-white/20
                      transition
                    "
                  >
                    + Novo livro
                  </Link>

                </div>

              </div>

              {/* ÁREA RESERVADA PARA OS BONEQUINHOS */}

              <div
                className="
                  hidden md:flex
                  relative
                  w-full
                  lg:w-[330px]
                  h-[190px]
                  items-end
                  justify-center
                "
              >

                <div
                  className="
                    absolute
                    bottom-0
                    w-[270px]
                    h-[110px]
                    rounded-full
                    bg-white/10
                    blur-sm
                  "
                />

                <div className="relative text-center">

                  <div className="text-7xl">
                    📚
                  </div>

                  <p className="text-xs text-blue-100 mt-2 font-semibold">
                    Um acervo cheio de descobertas
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* DASHBOARD */}

        <HomeDashboard
          totalLivros={totalLivros}
          totalExemplares={totalExemplares}
          disponiveis={disponiveis}
          emprestados={emprestados}
          devolvidos={devolvidos}
          reservas={reservas}
          atrasados={atrasados}
        />

        {/* ACESSO RÁPIDO */}

        <section
          className="
            bg-white
            border border-gray-100
            rounded-[2rem]
            shadow-sm
            overflow-hidden
          "
        >

          <div className="px-5 py-6 sm:px-7 border-b border-gray-100">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">
                  Acesso rápido
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Acesse rapidamente as principais áreas da biblioteca.
                </p>

              </div>

              <div
                className="
                  hidden sm:flex
                  w-11 h-11
                  rounded-2xl
                  bg-blue-50
                  text-blue-700
                  items-center justify-center
                  text-xl
                "
              >
                ⚡
              </div>

            </div>

          </div>

          <div className="p-5 sm:p-7">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <Link
                href="/biblioteca"
                className="
                  group
                  rounded-2xl
                  border border-blue-100
                  bg-blue-50/60
                  p-5
                  hover:bg-blue-100
                  hover:-translate-y-1
                  transition-all
                "
              >

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-white
                    text-blue-700
                    flex items-center justify-center
                    text-xl
                    shadow-sm
                    mb-4
                  "
                >
                  📚
                </div>

                <p className="font-extrabold text-blue-700">
                  Biblioteca
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Consultar o acervo
                </p>

              </Link>

              <Link
                href="/cadastro"
                className="
                  group
                  rounded-2xl
                  border border-emerald-100
                  bg-emerald-50/60
                  p-5
                  hover:bg-emerald-100
                  hover:-translate-y-1
                  transition-all
                "
              >

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-white
                    text-emerald-700
                    flex items-center justify-center
                    text-xl
                    shadow-sm
                    mb-4
                  "
                >
                  +
                </div>

                <p className="font-extrabold text-emerald-700">
                  Novo Livro
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Cadastrar um livro
                </p>

              </Link>

              <Link
                href="/emprestimos"
                className="
                  group
                  rounded-2xl
                  border border-orange-100
                  bg-orange-50/60
                  p-5
                  hover:bg-orange-100
                  hover:-translate-y-1
                  transition-all
                "
              >

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-white
                    text-orange-700
                    flex items-center justify-center
                    text-xl
                    shadow-sm
                    mb-4
                  "
                >
                  ↗
                </div>

                <p className="font-extrabold text-orange-700">
                  Empréstimos
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Ver livros emprestados
                </p>

              </Link>

              <Link
                href="/reservas"
                className="
                  group
                  rounded-2xl
                  border border-purple-100
                  bg-purple-50/60
                  p-5
                  hover:bg-purple-100
                  hover:-translate-y-1
                  transition-all
                "
              >

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-white
                    text-purple-700
                    flex items-center justify-center
                    text-xl
                    shadow-sm
                    mb-4
                  "
                >
                  ⚑
                </div>

                <p className="font-extrabold text-purple-700">
                  Reservas
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Ver reservas pendentes
                </p>

              </Link>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}