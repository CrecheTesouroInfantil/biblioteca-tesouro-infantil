"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eef5ff] p-4 md:p-8 flex items-center justify-center">

      <div className="w-full max-w-6xl">

        {/* CABEÇALHO */}

        <div className="text-center mb-8 md:mb-10">

          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-lg flex items-center justify-center">
              <img
                src="/logo-creche.png"
                alt="Creche Tesouro Infantil"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.22em] font-extrabold text-blue-600">
            Sistema de Gestão
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mt-2">
            Tesouro Infantil
          </h1>

          <p className="text-slate-500 mt-3 text-sm md:text-base">
            Escolha uma área para continuar
          </p>

        </div>

        {/* ÁREAS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">

          {/* BIBLIOTECA */}

          <Link
            href="/biblioteca"
            className="
              group
              bg-white
              rounded-[2rem]
              border border-blue-100
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition-all
              overflow-hidden
            "
          >

            <div className="bg-gradient-to-br from-[#1748d1] via-[#2457dc] to-[#12358f] p-7 text-white">

              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-4xl mb-5">
                📚
              </div>

              <h2 className="text-2xl font-extrabold">
                Biblioteca
              </h2>

              <p className="text-blue-100 text-sm mt-2">
                Consulte livros, faça reservas e encontre o acervo da Creche Tesouro Infantil.
              </p>

            </div>

            <div className="p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-extrabold text-slate-800">
                    Acessar biblioteca
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Livros e reservas
                  </p>
                </div>

                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition">
                  →
                </span>

              </div>

            </div>

          </Link>

          {/* SECRETARIA */}

          <Link
            href="/sistema"
            className="
              group
              bg-white
              rounded-[2rem]
              border border-emerald-100
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition-all
              overflow-hidden
            "
          >

            <div className="bg-gradient-to-br from-[#087f5b] via-[#099268] to-[#087f5b] p-7 text-white">

              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-4xl mb-5">
                🏫
              </div>

              <h2 className="text-2xl font-extrabold">
                Secretaria
              </h2>

              <p className="text-emerald-100 text-sm mt-2">
                Gerencie alunos, matrículas, turmas, documentos e Censo Escolar.
              </p>

            </div>

            <div className="p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-extrabold text-slate-800">
                    Acessar secretaria
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Gestão administrativa
                  </p>
                </div>

                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition">
                  →
                </span>

              </div>

            </div>

          </Link>

          {/* CAMPANHA ADMINISTRATIVA */}

          <Link
            href="/campanha/admin"
            className="
              group
              bg-white
              rounded-[2rem]
              border border-amber-100
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              transition-all
              overflow-hidden
            "
          >

            <div className="bg-gradient-to-br from-[#f59f00] via-[#f08c00] to-[#e67700] p-7 text-white">

              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-4xl mb-5">
                🎁
              </div>

              <h2 className="text-2xl font-extrabold">
                Campanha
              </h2>

              <p className="text-amber-100 text-sm mt-2">
                Administração da campanha Adote uma Criança.
              </p>

            </div>

            <div className="p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-extrabold text-slate-800">
                    Acessar campanha
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Área administrativa
                  </p>
                </div>

                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:bg-amber-500 group-hover:text-white transition">
                  →
                </span>

              </div>

            </div>

          </Link>

        </div>

        {/* RODAPÉ */}

        <div className="text-center mt-8">

          <p className="text-xs text-slate-400">
            Creche Tesouro Infantil • Sistema Integrado
          </p>

        </div>

      </div>

    </main>
  );
}