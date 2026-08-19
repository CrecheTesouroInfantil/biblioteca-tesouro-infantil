"use client";

import { useEffect, useState } from "react";
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
    capa: string;
  };
}

type Filtro = "todos" | "emprestados" | "atrasados" | "devolvidos";

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  useEffect(() => {
    buscarEmprestimos();
  }, []);

  async function buscarEmprestimos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("emprestimos")
      .select(`
        *,
        livros (
          nome,
          capa
        )
      `)
      .order("data_emprestimo", { ascending: false });

    if (error) {
      console.log(error);
      setCarregando(false);
      return;
    }

    setEmprestimos((data as Emprestimo[]) || []);
    setCarregando(false);
  }

  function estaAtrasado(item: Emprestimo) {
    if (item.devolvido) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const prevista = new Date(item.data_prevista + "T00:00:00");

    return prevista < hoje;
  }

  async function devolverLivro(item: Emprestimo) {
    const confirmar = confirm(
      `Deseja marcar "${item.livros?.nome}" como devolvido?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("emprestimos")
      .update({
        devolvido: true,
        data_devolucao: new Date().toISOString().split("T")[0],
      })
      .eq("id", item.id);

    if (error) {
      alert("Erro ao devolver livro.");
      console.log(error);
      return;
    }

    const { data: livro, error: erroLivro } = await supabase
      .from("livros")
      .select("quantidade")
      .eq("id", item.livro_id)
      .single();

    if (!erroLivro && livro) {
      await supabase
        .from("livros")
        .update({
          quantidade: (livro.quantidade ?? 0) + 1,
        })
        .eq("id", item.livro_id);
    }

    const { data: reserva } = await supabase
      .from("reservas")
      .select("*")
      .eq("livro_id", item.livro_id)
      .eq("atendida", false)
      .order("data_reserva", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (reserva) {
      alert(
        `📌 Livro devolvido com sucesso!\n\nExiste uma reserva aguardando este livro.\n\nTurma: ${reserva.sala}`
      );
    } else {
      alert("Livro devolvido com sucesso!");
    }

    buscarEmprestimos();
  }

  const total = emprestimos.length;

  const emprestados = emprestimos.filter(
    (item) => !item.devolvido
  ).length;

  const atrasados = emprestimos.filter(
    (item) => estaAtrasado(item)
  ).length;

  const devolvidos = emprestimos.filter(
    (item) => item.devolvido
  ).length;

  const emprestimosFiltrados = emprestimos.filter((item) => {

    if (filtro === "emprestados") {
      return !item.devolvido;
    }

    if (filtro === "atrasados") {
      return estaAtrasado(item);
    }

    if (filtro === "devolvidos") {
      return item.devolvido;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* CABEÇALHO */}

        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            📤 Empréstimos
          </h1>

          <p className="text-gray-500 mt-2">
            Controle de livros emprestados e devoluções
          </p>

        </div>

        {/* RESUMO */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <button
            onClick={() => setFiltro("todos")}
            className={`bg-white rounded-2xl shadow-lg p-5 text-left transition ${
              filtro === "todos"
                ? "ring-2 ring-blue-600"
                : ""
            }`}
          >
            <p className="text-gray-500 text-sm">
              Total
            </p>

            <p className="text-3xl font-bold text-blue-700 mt-1">
              {total}
            </p>

            <p className="text-sm mt-1">
              📚 empréstimos
            </p>
          </button>

          <button
            onClick={() => setFiltro("emprestados")}
            className={`bg-white rounded-2xl shadow-lg p-5 text-left transition ${
              filtro === "emprestados"
                ? "ring-2 ring-blue-600"
                : ""
            }`}
          >
            <p className="text-gray-500 text-sm">
              Emprestados
            </p>

            <p className="text-3xl font-bold text-orange-600 mt-1">
              {emprestados}
            </p>

            <p className="text-sm mt-1">
              📤 em circulação
            </p>
          </button>

          <button
            onClick={() => setFiltro("atrasados")}
            className={`bg-white rounded-2xl shadow-lg p-5 text-left transition ${
              filtro === "atrasados"
                ? "ring-2 ring-red-600"
                : ""
            }`}
          >
            <p className="text-gray-500 text-sm">
              Atrasados
            </p>

            <p className="text-3xl font-bold text-red-600 mt-1">
              {atrasados}
            </p>

            <p className="text-sm mt-1">
              ⏰ precisam voltar
            </p>
          </button>

          <button
            onClick={() => setFiltro("devolvidos")}
            className={`bg-white rounded-2xl shadow-lg p-5 text-left transition ${
              filtro === "devolvidos"
                ? "ring-2 ring-green-600"
                : ""
            }`}
          >
            <p className="text-gray-500 text-sm">
              Devolvidos
            </p>

            <p className="text-3xl font-bold text-green-600 mt-1">
              {devolvidos}
            </p>

            <p className="text-sm mt-1">
              ✅ finalizados
            </p>
          </button>

        </div>

        {/* FILTRO ATUAL */}

        <div className="flex flex-wrap gap-2 mb-6">

          <button
            onClick={() => setFiltro("todos")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filtro === "todos"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => setFiltro("emprestados")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filtro === "emprestados"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            📤 Emprestados
          </button>

          <button
            onClick={() => setFiltro("atrasados")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filtro === "atrasados"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            ⏰ Atrasados
          </button>

          <button
            onClick={() => setFiltro("devolvidos")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filtro === "devolvidos"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            ✅ Devolvidos
          </button>

        </div>

        {/* LISTA */}

        {carregando ? (

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
            Carregando...
          </div>

        ) : emprestimosFiltrados.length === 0 ? (

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-500">

            {filtro === "atrasados"
              ? "🎉 Nenhum empréstimo atrasado!"
              : "Nenhum empréstimo encontrado."}

          </div>

        ) : (

          <div className="space-y-5">

            {emprestimosFiltrados.map((item) => {

              const atrasado = estaAtrasado(item);

              return (

                <div
                  key={item.id}
                  className={`bg-white rounded-3xl shadow-lg p-5 md:p-6 border-l-8 ${
                    item.devolvido
                      ? "border-green-500"
                      : atrasado
                      ? "border-red-500"
                      : "border-blue-500"
                  }`}
                >

                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                    <div className="min-w-0">

                      <h2 className="text-xl md:text-2xl font-bold text-blue-700 break-words">
                        📚 {item.livros?.nome}
                      </h2>

                      <div className="mt-4 space-y-1 text-gray-700">

                        <p>
                          <strong>👶 Turma:</strong>{" "}
                          {item.sala}
                        </p>

                        <p>
                          <strong>📅 Empréstimo:</strong>{" "}
                          {item.data_emprestimo}
                        </p>

                        <p>
                          <strong>📅 Previsão:</strong>{" "}
                          {item.data_prevista}
                        </p>

                        <p>
                          <strong>↩️ Devolução:</strong>{" "}
                          {item.data_devolucao || "-"}
                        </p>

                      </div>

                    </div>

                    <div className="shrink-0">

                      {item.devolvido ? (

                        <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
                          ✅ Devolvido
                        </span>

                      ) : atrasado ? (

                        <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold">
                          ⏰ Atrasado
                        </span>

                      ) : (

                        <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
                          📤 Emprestado
                        </span>

                      )}

                    </div>

                  </div>

                  {!item.devolvido && (

                    <button
                      onClick={() => devolverLivro(item)}
                      className="mt-5 w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      ✔ Marcar como devolvido
                    </button>

                  )}

                </div>

              );

            })}

          </div>

        )}

      </div>

    </main>
  );
}