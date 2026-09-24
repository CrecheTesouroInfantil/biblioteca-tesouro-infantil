"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseSistema } from "@/lib/supabaseSistema";

export default function SistemaDashboardPage() {
  const [alunosAtivos, setAlunosAtivos] = useState(0);
  const [matriculas, setMatriculas] = useState(0);
  const [documentosPendentes, setDocumentosPendentes] = useState(0);
  const [censoCadastrado, setCensoCadastrado] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDashboard() {
      setCarregando(true);

      const { count: alunos } = await supabaseSistema
        .from("alunos")
        .select("*", { count: "exact", head: true })
        .eq("ativo", true);

      const { count: mats } = await supabaseSistema
        .from("matriculas")
        .select("*", { count: "exact", head: true })
        .eq("ano_letivo", 2026);

      const { count: docs } = await supabaseSistema
        .from("documentos_alunos")
        .select("*", { count: "exact", head: true })
        .eq("entregue", false);

      const { count: censo } = await supabaseSistema
        .from("censo_escolar")
        .select("*", { count: "exact", head: true })
        .eq("ano_letivo", 2026)
        .eq("cadastrado", true);

      setAlunosAtivos(alunos ?? 0);
      setMatriculas(mats ?? 0);
      setDocumentosPendentes(docs ?? 0);
      setCensoCadastrado(censo ?? 0);

      setCarregando(false);
    }

    carregarDashboard();
  }, []);

  const cards = [
    {
      titulo: "Alunos ativos",
      valor: alunosAtivos,
      descricao: "Cadastrados no sistema",
      icone: "👧",
      fundo: "bg-blue-50",
    },
    {
      titulo: "Matrículas",
      valor: matriculas,
      descricao: "No ano letivo de 2026",
      icone: "📝",
      fundo: "bg-emerald-50",
    },
    {
      titulo: "Documentos pendentes",
      valor: documentosPendentes,
      descricao: "Precisam ser conferidos",
      icone: "📂",
      fundo: "bg-amber-50",
    },
    {
      titulo: "Censo Escolar",
      valor: censoCadastrado,
      descricao: "Alunos cadastrados",
      icone: "🏛️",
      fundo: "bg-purple-50",
    },
  ];

  const acessos = [
    {
      nome: "Alunos",
      descricao: "Consultar e cadastrar alunos",
      icone: "👧",
      link: "/sistema/alunos",
      classe: "bg-blue-50 border-blue-100 text-blue-700",
    },
    {
      nome: "Turmas",
      descricao: "Ver turmas e alunos",
      icone: "👩‍🏫",
      link: "/sistema/turmas",
      classe: "bg-orange-50 border-orange-100 text-orange-700",
    },
    {
      nome: "Matrículas",
      descricao: "Controle das matrículas",
      icone: "📝",
      link: "/sistema/matriculas",
      classe: "bg-emerald-50 border-emerald-100 text-emerald-700",
    },
    {
      nome: "Censo Escolar",
      descricao: "Conferir situação do Censo",
      icone: "🏛️",
      link: "/sistema/censo",
      classe: "bg-purple-50 border-purple-100 text-purple-700",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-7">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* CABEÇALHO */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <p className="text-sm font-semibold text-blue-600">
              Sistema de Gestão
            </p>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
              Sistema Tesouro Infantil
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Gestão administrativa da Creche Tesouro Infantil
            </p>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">

            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Ano letivo
            </p>

            <p className="font-extrabold text-slate-700">
              2026
            </p>

          </div>

        </header>

        {/* BANNER */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1748d1] via-[#2457dc] to-[#12358f] text-white shadow-xl">

          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/10" />

          <div className="absolute -right-10 -bottom-32 w-64 h-64 rounded-full bg-white/5" />

          <div className="relative p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

              <div className="max-w-2xl">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">

                    <img
                      src="/logo-creche.png"
                      alt="Creche Tesouro Infantil"
                      className="w-11 h-11 object-contain"
                    />

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-[0.18em] font-bold text-blue-100">
                      Bem-vinda!
                    </p>

                    <p className="font-bold">
                      Creche Tesouro Infantil
                    </p>

                  </div>

                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">

                  Aqui crescem

                  <span className="block text-blue-100">
                    grandes histórias!
                  </span>

                </h2>

                <p className="text-blue-100 text-sm sm:text-base lg:text-lg mt-4 max-w-xl leading-relaxed">
                  Organize a rotina da creche, acompanhe os alunos,
                  matrículas, documentos e todas as informações
                  importantes em um só lugar.
                </p>

                <div className="flex flex-wrap gap-3 mt-7">

                  <Link
                    href="/sistema/alunos"
                    className="bg-white text-blue-700 px-5 py-3 rounded-xl font-extrabold shadow-lg hover:bg-blue-50 transition"
                  >
                    👧 Ver alunos
                  </Link>

                  <Link
                    href="/sistema/turmas"
                    className="bg-white/10 border border-white/20 text-white px-5 py-3 rounded-xl font-bold hover:bg-white/20 transition"
                  >
                    👩‍🏫 Ver turmas
                  </Link>

                </div>

              </div>

              <div className="relative w-full lg:w-[390px] h-[240px] flex items-end justify-center shrink-0">

                <div className="absolute bottom-2 w-[320px] h-[80px] rounded-full bg-white/10 blur-sm" />

                <img
                  src="/imagem02.png"
                  alt="Crianças da Creche Tesouro Infantil usando uniforme"
                  className="relative z-10 w-full max-w-[390px] h-full object-contain object-bottom drop-shadow-[0_12px_18px_rgba(0,0,0,0.18)]"
                />

              </div>

            </div>

          </div>

        </section>

        {/* CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {cards.map((card) => (

            <div
              key={card.titulo}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-semibold text-slate-500">
                    {card.titulo}
                  </p>

                  <p className="text-3xl font-extrabold text-slate-800 mt-2">
                    {carregando ? "..." : card.valor}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {card.descricao}
                  </p>

                </div>

                <div
                  className={`w-12 h-12 rounded-2xl ${card.fundo} flex items-center justify-center text-xl`}
                >
                  {card.icone}
                </div>

              </div>

            </div>

          ))}

        </section>

        {/* PENDÊNCIAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-xl font-extrabold text-slate-800">
                  Pendências
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  O que precisa da sua atenção
                </p>

              </div>

              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-xl">
                ⚠️
              </div>

            </div>

            <div className="space-y-3">

              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">

                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  👧
                </div>

                <div className="flex-1">

                  <p className="font-bold text-slate-700">
                    Cadastro de alunos
                  </p>

                  <p className="text-sm text-slate-400">
                    {alunosAtivos === 0
                      ? "Nenhum aluno cadastrado ainda"
                      : `${alunosAtivos} aluno(s) ativo(s) cadastrado(s)`}
                  </p>

                </div>

                <span className="text-xs font-bold text-blue-600">
                  {carregando ? "..." : alunosAtivos}
                </span>

              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">

                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  📂
                </div>

                <div className="flex-1">

                  <p className="font-bold text-slate-700">
                    Documentos
                  </p>

                  <p className="text-sm text-slate-400">
                    Documentos pendentes de conferência
                  </p>

                </div>

                <span className="text-xs font-bold text-amber-600">
                  {carregando ? "..." : documentosPendentes}
                </span>

              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">

                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  🏛️
                </div>

                <div className="flex-1">

                  <p className="font-bold text-slate-700">
                    Censo Escolar
                  </p>

                  <p className="text-sm text-slate-400">
                    Conferência dos alunos no Censo
                  </p>

                </div>

                <span className="text-xs font-bold text-purple-600">
                  {carregando ? "..." : censoCadastrado}
                </span>

              </div>

            </div>

          </section>

          {/* EVENTOS */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">

            <h2 className="text-xl font-extrabold text-slate-800">
              Próximos eventos
            </h2>

            <p className="text-sm text-slate-400 mt-1 mb-5">
              Agenda da creche
            </p>

            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">

              <div className="text-3xl mb-3">
                📅
              </div>

              <p className="font-extrabold text-blue-700">
                Nenhum evento cadastrado
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Os próximos eventos aparecerão aqui.
              </p>

            </div>

          </section>

        </div>

        {/* ACESSO RÁPIDO */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

          <div className="px-6 py-6 border-b border-slate-100">

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              Acesso rápido
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Acesse rapidamente as principais áreas do sistema.
            </p>

          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {acessos.map((item) => (

              <Link
                key={item.nome}
                href={item.link}
                className={`group rounded-2xl border p-5 hover:-translate-y-1 hover:shadow-sm transition-all ${item.classe}`}
              >

                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm mb-4">
                  {item.icone}
                </div>

                <p className="font-extrabold">
                  {item.nome}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {item.descricao}
                </p>

              </Link>

            ))}

          </div>

        </section>

        {/* RODAPÉ */}
        <div className="text-center py-4">

          <p className="text-xs text-slate-400">
            Sistema Tesouro Infantil • Ano Letivo 2026
          </p>

        </div>

      </div>

    </main>
  );
}