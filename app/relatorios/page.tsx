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
    const mapa: Record<
      string,
      number
    > = {};

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

  function imprimir() {
    window.print();
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-blue-50 p-6 md:p-8">
        <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
          Carregando relatórios...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 print:hidden">

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
              📊 Relatórios
            </h1>

            <p className="text-gray-500 mt-2">
              Visão geral da movimentação da biblioteca
            </p>
          </div>

          <button
            onClick={imprimir}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            🖨️ Imprimir relatório
          </button>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p className="text-gray-500">
              Livros cadastrados
            </p>
            <p className="text-3xl font-bold text-blue-700 mt-1">
              {livros.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p className="text-gray-500">
              Exemplares
            </p>
            <p className="text-3xl font-bold text-blue-700 mt-1">
              {totalExemplares}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p className="text-gray-500">
              Empréstimos ativos
            </p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {ativos.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p className="text-gray-500">
              Atrasados
            </p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {atrasados.length}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p className="text-gray-500">
              Total de empréstimos
            </p>
            <p className="text-3xl font-bold text-blue-700 mt-1">
              {emprestimos.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p className="text-gray-500">
              Devolvidos
            </p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {devolvidos.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p className="text-gray-500">
              Reservas pendentes
            </p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {reservasPendentes.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <p className="text-gray-500">
              Reservas atendidas
            </p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {reservasAtendidas.length}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <section className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold text-blue-700 mb-5">
              📚 Livros mais emprestados
            </h2>

            {livrosMaisEmprestados.length === 0 ? (

              <p className="text-gray-500">
                Ainda não existem empréstimos.
              </p>

            ) : (

              <div className="space-y-3">

                {livrosMaisEmprestados.map(
                  (livro, index) => (

                    <div
                      key={livro.nome}
                      className="flex items-center justify-between bg-blue-50 rounded-xl p-3"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <span className="font-bold text-blue-700">
                          {index + 1}º
                        </span>

                        <span className="font-semibold truncate">
                          {livro.nome}
                        </span>

                      </div>

                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {livro.quantidade}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          <section className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold text-blue-700 mb-5">
              👶 Empréstimos por turma
            </h2>

            {emprestimosPorTurma.length === 0 ? (

              <p className="text-gray-500">
                Ainda não existem empréstimos.
              </p>

            ) : (

              <div className="space-y-3">

                {emprestimosPorTurma.map(
                  (item) => (

                    <div
                      key={item.sala}
                      className="flex items-center justify-between bg-blue-50 rounded-xl p-3"
                    >

                      <span className="font-semibold">
                        👶 {item.sala}
                      </span>

                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {item.quantidade}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          <section className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold text-red-600 mb-5">
              ⏰ Empréstimos atrasados
            </h2>

            {atrasados.length === 0 ? (

              <div className="bg-green-50 text-green-700 rounded-2xl p-5 font-semibold">
                ✅ Nenhum empréstimo atrasado.
              </div>

            ) : (

              <div className="space-y-3">

                {atrasados.map((item) => (

                  <div
                    key={item.id}
                    className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4"
                  >

                    <p className="font-bold text-red-700">
                      📚 {item.livros?.nome}
                    </p>

                    <p className="text-sm mt-1">
                      👶 {item.sala}
                    </p>

                    <p className="text-sm">
                      📅 Devolução prevista:{" "}
                      {item.data_prevista}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </section>

          <section className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold text-purple-600 mb-5">
              📌 Reservas pendentes
            </h2>

            {reservasPendentes.length === 0 ? (

              <div className="bg-green-50 text-green-700 rounded-2xl p-5 font-semibold">
                ✅ Nenhuma reserva pendente.
              </div>

            ) : (

              <div className="space-y-3">

                {reservasPendentes.map((item) => (

                  <div
                    key={item.id}
                    className="bg-purple-50 border-l-4 border-purple-500 rounded-xl p-4"
                  >

                    <p className="font-bold text-purple-700">
                      📚 {item.livros?.nome}
                    </p>

                    <p className="text-sm mt-1">
                      👶 {item.sala}
                    </p>

                    <p className="text-sm">
                      📅 Reserva:{" "}
                      {item.data_reserva}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

      </div>

    </main>
  );
}