"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Turma {
  id: number;
  nome: string;
}

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
    capa: string | null;
  } | null;
}

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  const [nome, setNome] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [turmaSelecionada, setTurmaSelecionada] =
    useState<Turma | null>(null);

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    const [resultadoTurmas, resultadoEmprestimos] =
      await Promise.all([
        supabase
          .from("turmas")
          .select("*")
          .order("nome"),

        supabase
          .from("emprestimos")
          .select(`
            *,
            livros (
              nome,
              capa
            )
          `)
          .order("data_emprestimo", {
            ascending: false,
          }),
      ]);

    if (resultadoTurmas.error) {
      console.log(resultadoTurmas.error);
    }

    if (resultadoEmprestimos.error) {
      console.log(resultadoEmprestimos.error);
    }

    setTurmas(resultadoTurmas.data || []);
    setEmprestimos(
      (resultadoEmprestimos.data as Emprestimo[]) || []
    );

    setCarregando(false);
  }

  async function cadastrarTurma() {
    const nomeLimpo = nome.trim().toUpperCase();

    if (!nomeLimpo) {
      alert("Digite o nome da turma.");
      return;
    }

    const turmaExiste = turmas.some(
      (turma) =>
        turma.nome.toUpperCase() === nomeLimpo
    );

    if (turmaExiste) {
      alert("Esta turma já está cadastrada.");
      return;
    }

    const { error } = await supabase
      .from("turmas")
      .insert({
        nome: nomeLimpo,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setNome("");

    await carregarDados();
  }

  async function excluirTurma(turma: Turma) {
    const emprestimosAtivos = emprestimos.filter(
      (item) =>
        item.sala === turma.nome &&
        !item.devolvido
    );

    if (emprestimosAtivos.length > 0) {
      alert(
        `Não é possível excluir a turma "${turma.nome}" porque existem ${emprestimosAtivos.length} livro(s) emprestado(s) para ela.`
      );
      return;
    }

    const confirmar = confirm(
      `Deseja excluir a turma "${turma.nome}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("turmas")
      .delete()
      .eq("id", turma.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (turmaSelecionada?.id === turma.id) {
      setTurmaSelecionada(null);
    }

    await carregarDados();
  }

  function estaAtrasado(item: Emprestimo) {
    if (item.devolvido) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const prevista = new Date(
      item.data_prevista + "T00:00:00"
    );

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
        data_devolucao: new Date()
          .toISOString()
          .split("T")[0],
      })
      .eq("id", item.id);

    if (error) {
      alert("Erro ao devolver livro.");
      console.log(error);
      return;
    }

    const { data: livro, error: erroLivro } =
      await supabase
        .from("livros")
        .select("quantidade")
        .eq("id", item.livro_id)
        .single();

    if (erroLivro) {
      alert(
        "O empréstimo foi devolvido, mas não foi possível atualizar o estoque automaticamente."
      );
      console.log(erroLivro);
      await carregarDados();
      return;
    }

    const { error: erroEstoque } =
      await supabase
        .from("livros")
        .update({
          quantidade: (livro?.quantidade ?? 0) + 1,
        })
        .eq("id", item.livro_id);

    if (erroEstoque) {
      alert(
        "O empréstimo foi devolvido, mas houve um erro ao atualizar o estoque."
      );
      console.log(erroEstoque);
      await carregarDados();
      return;
    }

    alert("Livro devolvido com sucesso!");

    await carregarDados();
  }

  const turmasFiltradas = useMemo(() => {
    const texto = pesquisa
      .toLowerCase()
      .trim();

    if (!texto) return turmas;

    return turmas.filter((turma) =>
      turma.nome
        .toLowerCase()
        .includes(texto)
    );
  }, [turmas, pesquisa]);

  const totalEmprestimosAtivos = emprestimos.filter(
    (item) => !item.devolvido
  ).length;

  const totalAtrasados = emprestimos.filter(
    (item) => estaAtrasado(item)
  ).length;

  const emprestimosDaTurma =
    turmaSelecionada
      ? emprestimos.filter(
          (item) =>
            item.sala === turmaSelecionada.nome &&
            !item.devolvido
        )
      : [];

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* CABEÇALHO */}

        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            👶 Turmas
          </h1>

          <p className="text-gray-500 mt-2">
            Controle das turmas e dos livros emprestados
          </p>

        </div>

        {/* RESUMO */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-white rounded-2xl shadow-lg p-5">

            <p className="text-gray-500 text-sm">
              Turmas cadastradas
            </p>

            <p className="text-3xl font-bold text-blue-700 mt-1">
              {turmas.length}
            </p>

            <p className="text-sm mt-1">
              👶 turmas
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">

            <p className="text-gray-500 text-sm">
              Livros emprestados
            </p>

            <p className="text-3xl font-bold text-orange-600 mt-1">
              {totalEmprestimosAtivos}
            </p>

            <p className="text-sm mt-1">
              📤 em circulação
            </p>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">

            <p className="text-gray-500 text-sm">
              Empréstimos atrasados
            </p>

            <p className="text-3xl font-bold text-red-600 mt-1">
              {totalAtrasados}
            </p>

            <p className="text-sm mt-1">
              ⏰ precisam voltar
            </p>

          </div>

        </div>

        {/* CADASTRAR TURMA */}

        <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 mb-8">

          <h2 className="text-xl font-bold text-blue-700 mb-4">
            ➕ Cadastrar nova turma
          </h2>

          <div className="flex flex-col md:flex-row gap-3">

            <input
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  cadastrarTurma();
                }
              }}
              placeholder="Nome da turma"
              className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={cadastrarTurma}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
            >
              ➕ Adicionar turma
            </button>

          </div>

        </div>

        {/* PESQUISA */}

        <div className="bg-white rounded-3xl shadow-lg p-5 mb-6">

          <input
            value={pesquisa}
            onChange={(e) =>
              setPesquisa(e.target.value)
            }
            placeholder="🔎 Pesquisar turma..."
            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* CARREGANDO */}

        {carregando ? (

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
            Carregando...
          </div>

        ) : turmasFiltradas.length === 0 ? (

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-500">

            {turmas.length === 0
              ? "Nenhuma turma cadastrada."
              : "Nenhuma turma encontrada."}

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {turmasFiltradas.map((turma) => {

              const ativos = emprestimos.filter(
                (item) =>
                  item.sala === turma.nome &&
                  !item.devolvido
              );

              const atrasados = ativos.filter(
                (item) => estaAtrasado(item)
              );

              return (

                <div
                  key={turma.id}
                  className="bg-white rounded-3xl shadow-lg p-5 md:p-6"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div>

                      <h2 className="text-xl md:text-2xl font-bold text-blue-700">
                        👶 {turma.nome}
                      </h2>

                      <div className="flex flex-wrap gap-2 mt-3">

                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          📚 {ativos.length} emprestado(s)
                        </span>

                        {atrasados.length > 0 && (

                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                            ⏰ {atrasados.length} atrasado(s)
                          </span>

                        )}

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        setTurmaSelecionada(turma)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold"
                    >
                      👀 Ver livros
                    </button>

                  </div>

                  <div className="flex gap-3 mt-5">

                    <button
                      onClick={() =>
                        setTurmaSelecionada(turma)
                      }
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
                    >
                      📋 Detalhes
                    </button>

                    <button
                      onClick={() =>
                        excluirTurma(turma)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
                    >
                      🗑️ Excluir
                    </button>

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </div>

      {/* MODAL DA TURMA */}

      {turmaSelecionada && (

        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">

            {/* CABEÇALHO DO MODAL */}

            <div className="p-5 md:p-6 border-b flex items-center justify-between gap-4">

              <div>

                <h2 className="text-2xl md:text-3xl font-bold text-blue-700">
                  👶 {turmaSelecionada.nome}
                </h2>

                <p className="text-gray-500 mt-1">
                  {emprestimosDaTurma.length} livro(s) atualmente emprestado(s)
                </p>

              </div>

              <button
                onClick={() =>
                  setTurmaSelecionada(null)
                }
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>

            </div>

            {/* CONTEÚDO */}

            <div className="p-5 md:p-6 overflow-y-auto max-h-[65vh]">

              {emprestimosDaTurma.length === 0 ? (

                <div className="bg-green-50 text-green-700 rounded-2xl p-6 text-center font-semibold">
                  ✅ Esta turma não possui livros emprestados no momento.
                </div>

              ) : (

                <div className="space-y-4">

                  {emprestimosDaTurma.map((item) => {

                    const atrasado = estaAtrasado(item);

                    return (

                      <div
                        key={item.id}
                        className={`border-l-8 rounded-2xl p-4 ${
                          atrasado
                            ? "border-red-500 bg-red-50"
                            : "border-blue-500 bg-blue-50"
                        }`}
                      >

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                          <div className="min-w-0">

                            <h3 className="font-bold text-lg text-blue-700 break-words">
                              📚 {item.livros?.nome}
                            </h3>

                            <div className="text-sm text-gray-700 mt-2 space-y-1">

                              <p>
                                📅 Empréstimo:{" "}
                                {item.data_emprestimo}
                              </p>

                              <p>
                                📅 Devolução prevista:{" "}
                                {item.data_prevista}
                              </p>

                            </div>

                            <div className="mt-2">

                              {atrasado ? (

                                <span className="text-red-600 font-bold">
                                  ⏰ Atrasado
                                </span>

                              ) : (

                                <span className="text-blue-600 font-bold">
                                  📤 Emprestado
                                </span>

                              )}

                            </div>

                          </div>

                          <button
                            onClick={() =>
                              devolverLivro(item)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold shrink-0"
                          >
                            ✔ Devolver
                          </button>

                        </div>

                      </div>

                    );
                  })}

                </div>

              )}

            </div>

            {/* RODAPÉ */}

            <div className="p-5 border-t bg-gray-50">

              <button
                onClick={() =>
                  setTurmaSelecionada(null)
                }
                className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-bold"
              >
                Fechar
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}