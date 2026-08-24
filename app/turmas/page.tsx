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

    const [
      resultadoTurmas,
      resultadoEmprestimos,
    ] = await Promise.all([
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
    const emprestimosAtivos =
      emprestimos.filter(
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

    const {
      data: livro,
      error: erroLivro,
    } = await supabase
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
          quantidade:
            (livro?.quantidade ?? 0) + 1,
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

  const totalEmprestimosAtivos =
    emprestimos.filter(
      (item) => !item.devolvido
    ).length;

  const totalAtrasados =
    emprestimos.filter((item) =>
      estaAtrasado(item)
    ).length;

  const turmasComLivros =
    turmas.filter((turma) =>
      emprestimos.some(
        (item) =>
          item.sala === turma.nome &&
          !item.devolvido
      )
    ).length;

  const emprestimosDaTurma =
    turmaSelecionada
      ? emprestimos.filter(
          (item) =>
            item.sala ===
              turmaSelecionada.nome &&
            !item.devolvido
        )
      : [];

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
          "
        >

          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/10" />

          <div className="absolute -left-20 -bottom-32 w-64 h-64 rounded-full bg-white/5" />

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
                      Organização da biblioteca
                    </p>

                    <p className="font-bold">
                      Tesouro Infantil
                    </p>

                  </div>

                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold">
                  Turmas
                </h1>

                <p className="text-blue-100 mt-2 max-w-2xl">
                  Organize as turmas e acompanhe
                  os livros que estão em circulação.
                </p>

              </div>

              <div className="hidden sm:block bg-white/10 border border-white/10 rounded-3xl px-7 py-5 text-center">

                <p className="text-3xl font-extrabold">
                  {turmas.length}
                </p>

                <p className="text-xs text-blue-100 mt-1">
                  turmas cadastradas
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* RESUMO */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              👶
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Turmas cadastradas
            </p>

            <p className="text-3xl font-extrabold text-blue-700 mt-1">
              {turmas.length}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              turmas no sistema
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-xl">
              📤
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Livros em circulação
            </p>

            <p className="text-3xl font-extrabold text-orange-600 mt-1">
              {totalEmprestimosAtivos}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              empréstimos ativos
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
              {totalAtrasados}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              precisam voltar
            </p>

          </div>

        </section>

        {/* CADASTRAR */}

        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">

          <div className="flex flex-col md:flex-row md:items-end gap-4">

            <div className="flex-1">

              <div className="flex items-center gap-3 mb-4">

                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  ➕
                </div>

                <div>

                  <h2 className="text-xl font-extrabold text-gray-800">
                    Nova turma
                  </h2>

                  <p className="text-sm text-gray-500">
                    Cadastre uma turma para utilizar nos empréstimos.
                  </p>

                </div>

              </div>

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
                placeholder="Ex.: MATERNAL I"
                className="
                  w-full
                  border border-gray-200
                  bg-gray-50
                  rounded-xl
                  px-4 py-3
                  outline-none
                  font-semibold
                  text-gray-700
                  focus:bg-white
                  focus:ring-2
                  focus:ring-blue-500
                  transition
                "
              />

            </div>

            <button
              type="button"
              onClick={cadastrarTurma}
              className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-7
                py-3
                rounded-xl
                font-extrabold
                shadow-sm
                transition
              "
            >
              ➕ Adicionar turma
            </button>

          </div>

        </section>

        {/* PESQUISA */}

        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="font-extrabold text-gray-800">
                Turmas
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {turmasFiltradas.length} turma(s) encontrada(s)
              </p>

            </div>

            <div className="w-full md:w-80">

              <input
                value={pesquisa}
                onChange={(e) =>
                  setPesquisa(e.target.value)
                }
                placeholder="🔎 Pesquisar turma..."
                className="
                  w-full
                  border border-gray-200
                  bg-gray-50
                  rounded-xl
                  px-4 py-3
                  outline-none
                  focus:bg-white
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

            </div>

          </div>

        </section>

        {/* LISTAGEM */}

        {carregando ? (

          <div className="bg-white rounded-[2rem] shadow-sm p-12 text-center">

            <div className="text-5xl mb-4">
              👶
            </div>

            <p className="text-gray-500 font-semibold">
              Carregando turmas...
            </p>

          </div>

        ) : turmasFiltradas.length === 0 ? (

          <div className="bg-white rounded-[2rem] shadow-sm p-12 text-center">

            <div className="text-6xl mb-5">
              👶
            </div>

            <h2 className="text-xl font-extrabold text-gray-800">
              {turmas.length === 0
                ? "Nenhuma turma cadastrada"
                : "Nenhuma turma encontrada"}
            </h2>

            <p className="text-gray-500 mt-2">
              {turmas.length === 0
                ? "Cadastre a primeira turma para começar."
                : "Tente pesquisar por outro nome."}
            </p>

          </div>

        ) : (

          <section className="space-y-4">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-extrabold text-gray-800">
                  Suas turmas
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Clique em uma turma para ver os livros em circulação.
                </p>

              </div>

              <div className="hidden sm:flex bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold">
                📚 {turmasComLivros} com livros
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {turmasFiltradas.map((turma) => {

                const ativos =
                  emprestimos.filter(
                    (item) =>
                      item.sala ===
                        turma.nome &&
                      !item.devolvido
                  );

                const atrasados =
                  ativos.filter((item) =>
                    estaAtrasado(item)
                  );

                return (

                  <article
                    key={turma.id}
                    className="
                      bg-white
                      rounded-[2rem]
                      border border-gray-100
                      shadow-sm
                      overflow-hidden
                      hover:shadow-lg
                      transition
                    "
                  >

                    <div
                      className={`
                        h-1.5
                        ${
                          atrasados.length > 0
                            ? "bg-red-500"
                            : ativos.length > 0
                            ? "bg-blue-600"
                            : "bg-emerald-500"
                        }
                      `}
                    />

                    <div className="p-5 md:p-6">

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-4 min-w-0">

                          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl shrink-0">
                            👶
                          </div>

                          <div className="min-w-0">

                            <h3 className="text-xl font-extrabold text-gray-800 truncate">
                              {turma.nome}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                              Turma cadastrada
                            </p>

                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            excluirTurma(turma)
                          }
                          className="
                            w-10
                            h-10
                            rounded-xl
                            bg-gray-100
                            hover:bg-red-100
                            text-gray-500
                            hover:text-red-600
                            transition
                            shrink-0
                          "
                          title="Excluir turma"
                        >
                          🗑️
                        </button>

                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">

                        <div className="bg-blue-50 rounded-2xl p-4">

                          <p className="text-xs text-blue-500 font-bold uppercase">
                            Em circulação
                          </p>

                          <p className="text-2xl font-extrabold text-blue-700 mt-1">
                            {ativos.length}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            livro(s)
                          </p>

                        </div>

                        <div
                          className={`
                            rounded-2xl
                            p-4
                            ${
                              atrasados.length > 0
                                ? "bg-red-50"
                                : "bg-emerald-50"
                            }
                          `}
                        >

                          <p
                            className={`
                              text-xs
                              font-bold
                              uppercase
                              ${
                                atrasados.length > 0
                                  ? "text-red-500"
                                  : "text-emerald-500"
                              }
                            `}
                          >
                            Atrasados
                          </p>

                          <p
                            className={`
                              text-2xl
                              font-extrabold
                              mt-1
                              ${
                                atrasados.length > 0
                                  ? "text-red-600"
                                  : "text-emerald-600"
                              }
                            `}
                          >
                            {atrasados.length}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {atrasados.length > 0
                              ? "atenção"
                              : "tudo em dia"}
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setTurmaSelecionada(turma)
                        }
                        className="
                          w-full
                          mt-4
                          bg-blue-600
                          hover:bg-blue-700
                          text-white
                          py-3
                          rounded-xl
                          font-extrabold
                          transition
                        "
                      >
                        👀 Ver livros da turma
                      </button>

                    </div>

                  </article>

                );
              })}

            </div>

          </section>

        )}

      </div>

      {/* MODAL */}

      {turmaSelecionada && (

        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">

          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">

            {/* CABEÇALHO */}

            <div className="bg-gradient-to-br from-[#1748d1] to-[#12358f] text-white p-6">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl">
                    👶
                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wide text-blue-100 font-bold">
                      Detalhes da turma
                    </p>

                    <h2 className="text-2xl font-extrabold mt-1">
                      {turmaSelecionada.nome}
                    </h2>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTurmaSelecionada(null)
                  }
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-white/10
                    hover:bg-white/20
                    text-white
                    text-xl
                    transition
                  "
                >
                  ✕
                </button>

              </div>

            </div>

            {/* CONTEÚDO */}

            <div className="p-5 md:p-6 overflow-y-auto max-h-[65vh]">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h3 className="text-lg font-extrabold text-gray-800">
                    Livros em circulação
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {emprestimosDaTurma.length} livro(s) atualmente emprestado(s)
                  </p>

                </div>

                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm">
                  📚 {emprestimosDaTurma.length}
                </div>

              </div>

              {emprestimosDaTurma.length === 0 ? (

                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-7 text-center">

                  <div className="text-5xl mb-3">
                    🎉
                  </div>

                  <p className="font-extrabold">
                    Nenhum livro emprestado!
                  </p>

                  <p className="text-sm mt-1">
                    Esta turma está sem livros em circulação.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {emprestimosDaTurma.map(
                    (item) => {

                      const atrasado =
                        estaAtrasado(item);

                      return (

                        <article
                          key={item.id}
                          className={`
                            rounded-2xl
                            border
                            overflow-hidden
                            ${
                              atrasado
                                ? "border-red-200 bg-red-50"
                                : "border-blue-100 bg-blue-50"
                            }
                          `}
                        >

                          <div className="p-4">

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                              <div className="w-16 h-20 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">

                                {item.livros?.capa ? (

                                  <img
                                    src={item.livros.capa}
                                    alt={item.livros.nome}
                                    className="w-full h-full object-cover"
                                  />

                                ) : (

                                  <div className="w-full h-full flex items-center justify-center text-2xl">
                                    📚
                                  </div>

                                )}

                              </div>

                              <div className="flex-1 min-w-0">

                                <h4 className="font-extrabold text-gray-800 text-lg">
                                  {item.livros?.nome}
                                </h4>

                                <div className="mt-2 space-y-1 text-sm text-gray-600">

                                  <p>
                                    📅 Empréstimo:{" "}
                                    <strong>
                                      {item.data_emprestimo}
                                    </strong>
                                  </p>

                                  <p>
                                    📅 Devolução prevista:{" "}
                                    <strong>
                                      {item.data_prevista}
                                    </strong>
                                  </p>

                                </div>

                                <div className="mt-3">

                                  {atrasado ? (

                                    <span className="inline-flex bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-extrabold">
                                      ⏰ Atrasado
                                    </span>

                                  ) : (

                                    <span className="inline-flex bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-extrabold">
                                      📤 Em circulação
                                    </span>

                                  )}

                                </div>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  devolverLivro(item)
                                }
                                className="
                                  w-full
                                  sm:w-auto
                                  bg-emerald-600
                                  hover:bg-emerald-700
                                  text-white
                                  px-5
                                  py-3
                                  rounded-xl
                                  font-extrabold
                                  transition
                                  shrink-0
                                "
                              >
                                ✓ Devolver
                              </button>

                            </div>

                          </div>

                        </article>

                      );
                    }
                  )}

                </div>

              )}

            </div>

            {/* RODAPÉ */}

            <div className="p-5 border-t bg-gray-50">

              <button
                type="button"
                onClick={() =>
                  setTurmaSelecionada(null)
                }
                className="
                  w-full
                  bg-gray-800
                  hover:bg-gray-900
                  text-white
                  py-3
                  rounded-xl
                  font-extrabold
                  transition
                "
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