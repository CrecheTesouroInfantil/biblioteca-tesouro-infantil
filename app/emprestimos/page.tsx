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

type Filtro =
  | "todos"
  | "emprestados"
  | "atrasados"
  | "devolvidos";

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
      .order("data_emprestimo", {
        ascending: false,
      });

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
      .order("data_reserva", {
        ascending: true,
      })
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

  const emprestimosFiltrados = emprestimos.filter(
    (item) => {
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
    }
  );

  function selecionarFiltro(novoFiltro: Filtro) {
    setFiltro(novoFiltro);
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
                      Controle do acervo
                    </p>

                    <p className="font-bold">
                      Tesouro Infantil
                    </p>

                  </div>

                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold">
                  Empréstimos
                </h1>

                <p className="text-blue-100 mt-2 max-w-2xl">
                  Acompanhe os livros em circulação,
                  devoluções e prazos do acervo.
                </p>

              </div>

              <div className="hidden sm:flex bg-white/10 border border-white/10 rounded-3xl px-7 py-5 text-center">

                <p className="text-3xl font-extrabold">
                  {emprestados}
                </p>

                <p className="text-xs text-blue-100 mt-1">
                  em circulação
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* INDICADORES */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <button
            type="button"
            onClick={() =>
              selecionarFiltro("todos")
            }
            className={`
              text-left
              bg-white
              rounded-3xl
              border
              p-5
              shadow-sm
              transition-all
              hover:-translate-y-1
              hover:shadow-lg
              ${
                filtro === "todos"
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-100"
              }
            `}
          >

            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              📚
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Total
            </p>

            <p className="text-3xl font-extrabold text-blue-700 mt-1">
              {total}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              empréstimos registrados
            </p>

          </button>

          <button
            type="button"
            onClick={() =>
              selecionarFiltro("emprestados")
            }
            className={`
              text-left
              bg-white
              rounded-3xl
              border
              p-5
              shadow-sm
              transition-all
              hover:-translate-y-1
              hover:shadow-lg
              ${
                filtro === "emprestados"
                  ? "border-orange-500 ring-2 ring-orange-100"
                  : "border-gray-100"
              }
            `}
          >

            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-xl">
              📤
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Emprestados
            </p>

            <p className="text-3xl font-extrabold text-orange-600 mt-1">
              {emprestados}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              em circulação
            </p>

          </button>

          <button
            type="button"
            onClick={() =>
              selecionarFiltro("atrasados")
            }
            className={`
              text-left
              bg-white
              rounded-3xl
              border
              p-5
              shadow-sm
              transition-all
              hover:-translate-y-1
              hover:shadow-lg
              ${
                filtro === "atrasados"
                  ? "border-red-500 ring-2 ring-red-100"
                  : "border-gray-100"
              }
            `}
          >

            <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-xl">
              ⏰
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Atrasados
            </p>

            <p className="text-3xl font-extrabold text-red-600 mt-1">
              {atrasados}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              precisam voltar
            </p>

          </button>

          <button
            type="button"
            onClick={() =>
              selecionarFiltro("devolvidos")
            }
            className={`
              text-left
              bg-white
              rounded-3xl
              border
              p-5
              shadow-sm
              transition-all
              hover:-translate-y-1
              hover:shadow-lg
              ${
                filtro === "devolvidos"
                  ? "border-emerald-500 ring-2 ring-emerald-100"
                  : "border-gray-100"
              }
            `}
          >

            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
              ✓
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Devolvidos
            </p>

            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              {devolvidos}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              finalizados
            </p>

          </button>

        </section>

        {/* FILTROS */}

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <h2 className="font-extrabold text-gray-800">
                Filtrar empréstimos
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Selecione uma categoria para visualizar os registros.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() => selecionarFiltro("todos")}
                className={`
                  px-4 py-2.5
                  rounded-xl
                  text-sm
                  font-bold
                  transition
                  ${
                    filtro === "todos"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                Todos
              </button>

              <button
                type="button"
                onClick={() =>
                  selecionarFiltro("emprestados")
                }
                className={`
                  px-4 py-2.5
                  rounded-xl
                  text-sm
                  font-bold
                  transition
                  ${
                    filtro === "emprestados"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                Emprestados
              </button>

              <button
                type="button"
                onClick={() =>
                  selecionarFiltro("atrasados")
                }
                className={`
                  px-4 py-2.5
                  rounded-xl
                  text-sm
                  font-bold
                  transition
                  ${
                    filtro === "atrasados"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                Atrasados
              </button>

              <button
                type="button"
                onClick={() =>
                  selecionarFiltro("devolvidos")
                }
                className={`
                  px-4 py-2.5
                  rounded-xl
                  text-sm
                  font-bold
                  transition
                  ${
                    filtro === "devolvidos"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                Devolvidos
              </button>

            </div>

          </div>

        </section>

        {/* LISTAGEM */}

        {carregando ? (

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">

            <div className="text-5xl mb-4">
              📚
            </div>

            <p className="text-gray-500 font-semibold">
              Carregando empréstimos...
            </p>

          </div>

        ) : emprestimosFiltrados.length === 0 ? (

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 md:p-16 text-center">

            <div className="text-6xl mb-5">
              {filtro === "atrasados"
                ? "🎉"
                : "📚"}
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">
              {filtro === "atrasados"
                ? "Nenhum empréstimo atrasado!"
                : "Nenhum empréstimo encontrado"}
            </h2>

            <p className="text-gray-500 mt-2">
              {filtro === "atrasados"
                ? "Está tudo em dia com as devoluções."
                : "Não existem registros para este filtro."}
            </p>

          </div>

        ) : (

          <section className="space-y-4">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-extrabold text-gray-800">
                  Movimentações
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {emprestimosFiltrados.length} registro(s) encontrado(s)
                </p>

              </div>

            </div>

            {emprestimosFiltrados.map((item) => {

              const atrasado =
                estaAtrasado(item);

              return (

                <article
                  key={item.id}
                  className="
                    bg-white
                    rounded-3xl
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
                        item.devolvido
                          ? "bg-emerald-500"
                          : atrasado
                          ? "bg-red-500"
                          : "bg-blue-600"
                      }
                    `}
                  />

                  <div className="p-5 md:p-6">

                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                      {/* LIVRO */}

                      <div className="flex items-center gap-4 min-w-0 flex-1">

                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-blue-50 shrink-0 shadow-sm">

                          {item.livros?.capa ? (

                            <img
                              src={item.livros.capa}
                              alt={item.livros.nome}
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              📚
                            </div>

                          )}

                        </div>

                        <div className="min-w-0">

                          <h3 className="text-lg md:text-xl font-extrabold text-gray-800 line-clamp-2">
                            {item.livros?.nome}
                          </h3>

                          <div className="flex flex-wrap gap-2 mt-3">

                            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold">
                              👶 {item.sala}
                            </span>

                            {item.devolvido ? (

                              <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold">
                                ✓ Devolvido
                              </span>

                            ) : atrasado ? (

                              <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold">
                                ⏰ Atrasado
                              </span>

                            ) : (

                              <span className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">
                                📤 Emprestado
                              </span>

                            )}

                          </div>

                        </div>

                      </div>

                      {/* DATAS */}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:w-[430px]">

                        <div className="bg-gray-50 rounded-2xl p-3">

                          <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                            Empréstimo
                          </p>

                          <p className="text-sm font-bold text-gray-700 mt-1">
                            {item.data_emprestimo}
                          </p>

                        </div>

                        <div className="bg-gray-50 rounded-2xl p-3">

                          <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                            Previsão
                          </p>

                          <p
                            className={`
                              text-sm font-bold mt-1
                              ${
                                atrasado
                                  ? "text-red-600"
                                  : "text-gray-700"
                              }
                            `}
                          >
                            {item.data_prevista}
                          </p>

                        </div>

                        <div className="bg-gray-50 rounded-2xl p-3">

                          <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                            Devolução
                          </p>

                          <p className="text-sm font-bold text-gray-700 mt-1">
                            {item.data_devolucao || "-"}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* AÇÃO */}

                    {!item.devolvido && (

                      <div className="mt-5 pt-5 border-t border-gray-100 flex justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            devolverLivro(item)
                          }
                          className="
                            w-full
                            md:w-auto
                            bg-emerald-600
                            hover:bg-emerald-700
                            text-white
                            px-6
                            py-3
                            rounded-xl
                            font-extrabold
                            transition
                            shadow-sm
                          "
                        >
                          ✓ Marcar como devolvido
                        </button>

                      </div>

                    )}

                  </div>

                </article>

              );
            })}

          </section>

        )}

      </div>

    </main>
  );
}