"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Emprestimo {
  id: number;
  livro_id: number;
  sala: string;
  data_emprestimo: string;
  data_prevista: string;
  data_devolucao: string | null;
  devolvido: boolean;
  livros: {
    nome: string;
  } | null;
}

interface Reserva {
  id: number;
  sala: string;
  data_reserva: string;
  atendida: boolean;
  livros: {
    nome: string;
  } | null;
}

interface Livro {
  id: number;
  nome: string;
  categoria: string | null;
  quantidade: number | null;
  local: string | null;
}

export default function RelatoriosPage() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    const [
      resultadoEmprestimos,
      resultadoReservas,
      resultadoLivros,
    ] = await Promise.all([
      supabase
        .from("emprestimos")
        .select(`
          *,
          livros (
            nome
          )
        `)
        .order("data_emprestimo", {
          ascending: false,
        }),

      supabase
        .from("reservas")
        .select(`
          *,
          livros (
            nome
          )
        `)
        .order("data_reserva", {
          ascending: false,
        }),

      supabase
        .from("livros")
        .select(
          "id,nome,categoria,quantidade,local"
        ),
    ]);

    if (resultadoEmprestimos.error) {
      console.log(resultadoEmprestimos.error);
    }

    if (resultadoReservas.error) {
      console.log(resultadoReservas.error);
    }

    if (resultadoLivros.error) {
      console.log(resultadoLivros.error);
    }

    setEmprestimos(
      (resultadoEmprestimos.data as Emprestimo[]) || []
    );

    setReservas(
      (resultadoReservas.data as Reserva[]) || []
    );

    setLivros(
      (resultadoLivros.data as Livro[]) || []
    );

    setCarregando(false);
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  function atrasado(item: Emprestimo) {
    if (item.devolvido) return false;

    const data = new Date(
      item.data_prevista + "T00:00:00"
    );

    return data < hoje;
  }

  const ativos = emprestimos.filter(
    (item) => !item.devolvido
  );

  const devolvidos = emprestimos.filter(
    (item) => item.devolvido
  );

  const atrasados = emprestimos.filter(
    (item) => atrasado(item)
  );

  const reservasPendentes = reservas.filter(
    (item) => !item.atendida
  );

  const reservasAtendidas = reservas.filter(
    (item) => item.atendida
  );

  const totalExemplares = livros.reduce(
    (total, livro) =>
      total + (livro.quantidade ?? 0),
    0
  );

  const disponiveis = Math.max(
    totalExemplares - ativos.length,
    0
  );

  const livrosMaisEmprestados = useMemo(() => {
    const mapa: Record<
      string,
      {
        nome: string;
        quantidade: number;
      }
    > = {};

    emprestimos.forEach((item) => {
      const nome = item.livros?.nome;

      if (!nome) return;

      if (!mapa[nome]) {
        mapa[nome] = {
          nome,
          quantidade: 0,
        };
      }

      mapa[nome].quantidade++;
    });

    return Object.values(mapa)
      .sort(
        (a, b) =>
          b.quantidade - a.quantidade
      )
      .slice(0, 10);
  }, [emprestimos]);

  const emprestimosPorTurma = useMemo(() => {
    const mapa: Record<string, number> = {};

    emprestimos.forEach((item) => {
      if (!mapa[item.sala]) {
        mapa[item.sala] = 0;
      }

      mapa[item.sala]++;
    });

    return Object.entries(mapa)
      .map(([sala, quantidade]) => ({
        sala,
        quantidade,
      }))
      .sort(
        (a, b) =>
          b.quantidade - a.quantidade
      );
  }, [emprestimos]);

  const maiorQuantidadeTurma =
    emprestimosPorTurma.length > 0
      ? emprestimosPorTurma[0].quantidade
      : 1;

  function imprimir() {
    window.print();
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#eef5ff] p-4 md:p-8">

        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-[2rem] shadow-lg p-12 text-center">

            <div className="text-5xl mb-4">
              📊
            </div>

            <p className="text-gray-500 font-semibold">
              Carregando relatórios...
            </p>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef5ff] p-4 md:p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* CABEÇALHO */}

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
            print:bg-white
            print:text-black
            print:shadow-none
          "
        >

          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/10 print:hidden" />

          <div className="absolute -left-20 -bottom-32 w-64 h-64 rounded-full bg-white/5 print:hidden" />

          <div className="relative p-6 md:p-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">

                    <img
                      src="/logo-creche.png"
                      alt="Creche Tesouro Infantil"
                      className="w-9 h-9 object-contain"
                    />

                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-100">
                      Gestão da biblioteca
                    </p>

                    <p className="font-bold">
                      Tesouro Infantil
                    </p>

                  </div>

                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold">
                  Relatórios
                </h1>

                <p className="text-blue-100 mt-2 max-w-2xl">
                  Uma visão geral do acervo,
                  empréstimos e reservas da biblioteca.
                </p>

              </div>

              <button
                type="button"
                onClick={imprimir}
                className="
                  print:hidden
                  bg-white
                  text-blue-700
                  hover:bg-blue-50
                  px-6
                  py-3
                  rounded-xl
                  font-extrabold
                  shadow-lg
                  transition
                "
              >
                🖨️ Imprimir relatório
              </button>

            </div>

          </div>

        </section>

        {/* RESUMO PRINCIPAL */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              📚
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Livros cadastrados
            </p>

            <p className="text-3xl font-extrabold text-blue-700 mt-1">
              {livros.length}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">
              📦
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Exemplares
            </p>

            <p className="text-3xl font-extrabold text-indigo-600 mt-1">
              {totalExemplares}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-xl">
              ✅
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Disponíveis
            </p>

            <p className="text-3xl font-extrabold text-green-600 mt-1">
              {disponiveis}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-xl">
              ⏰
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Atrasados
            </p>

            <p className="text-3xl font-extrabold text-red-600 mt-1">
              {atrasados.length}
            </p>

          </div>

        </section>

        {/* SEGUNDO RESUMO */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <p className="text-gray-500 text-sm">
              Total de empréstimos
            </p>

            <p className="text-3xl font-extrabold text-blue-700 mt-1">
              {emprestimos.length}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              movimentações registradas
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <p className="text-gray-500 text-sm">
              Em circulação
            </p>

            <p className="text-3xl font-extrabold text-orange-600 mt-1">
              {ativos.length}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              empréstimos ativos
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <p className="text-gray-500 text-sm">
              Devolvidos
            </p>

            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              {devolvidos.length}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              empréstimos finalizados
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <p className="text-gray-500 text-sm">
              Reservas pendentes
            </p>

            <p className="text-3xl font-extrabold text-purple-600 mt-1">
              {reservasPendentes.length}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              aguardando atendimento
            </p>

          </div>

        </section>

        {/* RANKING + TURMAS */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">
                  📚 Livros mais emprestados
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Ranking dos livros com maior circulação.
                </p>

              </div>

              <span className="hidden sm:flex w-11 h-11 rounded-2xl bg-blue-50 items-center justify-center text-xl">
                🏆
              </span>

            </div>

            {livrosMaisEmprestados.length === 0 ? (

              <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500">
                Ainda não existem empréstimos registrados.
              </div>

            ) : (

              <div className="space-y-3">

                {livrosMaisEmprestados.map(
                  (livro, index) => {

                    const percentual =
                      Math.max(
                        (livro.quantidade /
                          livrosMaisEmprestados[0]
                            .quantidade) *
                          100,
                        8
                      );

                    return (

                      <div
                        key={livro.nome}
                        className="bg-gray-50 rounded-2xl p-4"
                      >

                        <div className="flex items-center gap-3">

                          <div
                            className={`
                              w-9 h-9
                              rounded-xl
                              flex
                              items-center
                              justify-center
                              font-extrabold
                              shrink-0
                              ${
                                index === 0
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }
                            `}
                          >
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-3">

                              <p className="font-bold text-gray-800 truncate">
                                {livro.nome}
                              </p>

                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-extrabold shrink-0">
                                {livro.quantidade}x
                              </span>

                            </div>

                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">

                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{
                                  width: `${percentual}%`,
                                }}
                              />

                            </div>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </section>

          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">
                  👶 Empréstimos por turma
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Turmas que mais utilizam o acervo.
                </p>

              </div>

              <span className="hidden sm:flex w-11 h-11 rounded-2xl bg-blue-50 items-center justify-center text-xl">
                👶
              </span>

            </div>

            {emprestimosPorTurma.length === 0 ? (

              <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500">
                Ainda não existem empréstimos registrados.
              </div>

            ) : (

              <div className="space-y-4">

                {emprestimosPorTurma.map(
                  (item) => {

                    const percentual =
                      Math.max(
                        (item.quantidade /
                          maiorQuantidadeTurma) *
                          100,
                        8
                      );

                    return (

                      <div key={item.sala}>

                        <div className="flex items-center justify-between mb-2">

                          <span className="font-bold text-gray-700">
                            {item.sala}
                          </span>

                          <span className="text-sm font-extrabold text-blue-700">
                            {item.quantidade} empréstimo(s)
                          </span>

                        </div>

                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
                            style={{
                              width: `${percentual}%`,
                            }}
                          />

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </section>

        </div>

        {/* ATRASADOS + RESERVAS */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-xl md:text-2xl font-extrabold text-red-600">
                  ⏰ Empréstimos atrasados
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Livros que já passaram da data prevista.
                </p>

              </div>

              <span className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-xl">
                ⏰
              </span>

            </div>

            {atrasados.length === 0 ? (

              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-5 font-bold">
                ✅ Nenhum empréstimo atrasado.
              </div>

            ) : (

              <div className="space-y-3">

                {atrasados.map((item) => (

                  <div
                    key={item.id}
                    className="bg-red-50 border border-red-100 rounded-2xl p-4"
                  >

                    <div className="flex items-start gap-3">

                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                        📚
                      </div>

                      <div className="min-w-0">

                        <p className="font-extrabold text-red-700">
                          {item.livros?.nome ||
                            "Livro"}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          👶 {item.sala}
                        </p>

                        <p className="text-sm text-red-600 font-semibold mt-1">
                          📅 Devolução prevista:{" "}
                          {item.data_prevista}
                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-xl md:text-2xl font-extrabold text-purple-600">
                  📌 Reservas pendentes
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Solicitações que aguardam atendimento.
                </p>

              </div>

              <span className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center text-xl">
                📌
              </span>

            </div>

            {reservasPendentes.length === 0 ? (

              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-5 font-bold">
                ✅ Nenhuma reserva pendente.
              </div>

            ) : (

              <div className="space-y-3">

                {reservasPendentes.map((item) => (

                  <div
                    key={item.id}
                    className="bg-purple-50 border border-purple-100 rounded-2xl p-4"
                  >

                    <div className="flex items-start gap-3">

                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                        📚
                      </div>

                      <div className="min-w-0">

                        <p className="font-extrabold text-purple-700">
                          {item.livros?.nome ||
                            "Livro"}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          👶 {item.sala}
                        </p>

                        <p className="text-sm text-purple-600 font-semibold mt-1">
                          📅 Reserva:{" "}
                          {item.data_reserva}
                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

        {/* RESERVAS ATENDIDAS */}

        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">
                📌 Resumo das reservas
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Acompanhamento geral das solicitações.
              </p>

            </div>

            <div className="flex gap-3">

              <div className="bg-purple-50 rounded-2xl px-5 py-3">

                <p className="text-xs text-purple-500 font-bold">
                  Pendentes
                </p>

                <p className="text-2xl font-extrabold text-purple-700">
                  {reservasPendentes.length}
                </p>

              </div>

              <div className="bg-emerald-50 rounded-2xl px-5 py-3">

                <p className="text-xs text-emerald-500 font-bold">
                  Atendidas
                </p>

                <p className="text-2xl font-extrabold text-emerald-700">
                  {reservasAtendidas.length}
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

      {/* ESTILO DE IMPRESSÃO */}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          main {
            background: white !important;
            padding: 0 !important;
          }

          section {
            break-inside: avoid;
          }

          button {
            display: none !important;
          }
        }
      `}</style>

    </main>
  );
}