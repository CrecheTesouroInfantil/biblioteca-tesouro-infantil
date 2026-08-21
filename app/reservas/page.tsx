"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Reserva {
  id: number;
  livro_id: number;
  sala: string;
  data_reserva: string;
  atendida: boolean;
  livros: {
    nome: string;
    capa: string;
  };
}

type Filtro = "todas" | "pendentes" | "atendidas";

export default function Reservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("pendentes");

  const [modalAberto, setModalAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] =
    useState<Reserva | null>(null);

  const [dataPrevista, setDataPrevista] = useState("");
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    buscarReservas();
  }, []);

  async function buscarReservas() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("reservas")
      .select(`
        *,
        livros (
          nome,
          capa
        )
      `)
      .order("data_reserva", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      setCarregando(false);
      return;
    }

    setReservas((data as Reserva[]) || []);
    setCarregando(false);
  }

  function abrirAtendimento(reserva: Reserva) {
    setReservaSelecionada(reserva);

    const hoje = new Date();
    hoje.setDate(hoje.getDate() + 7);

    setDataPrevista(
      hoje.toISOString().split("T")[0]
    );

    setModalAberto(true);
  }

  function fecharModal() {
    if (processando) return;

    setModalAberto(false);
    setReservaSelecionada(null);
    setDataPrevista("");
  }

  async function atenderReserva() {
    if (!reservaSelecionada) return;

    if (!dataPrevista) {
      alert("Informe a data prevista para devolução.");
      return;
    }

    setProcessando(true);

    try {
      /*
       * 1. Verifica se ainda existe exemplar disponível.
       */

      const { data: livro, error: erroLivro } =
        await supabase
          .from("livros")
          .select("quantidade")
          .eq("id", reservaSelecionada.livro_id)
          .single();

      if (erroLivro || !livro) {
        throw new Error(
          "Não foi possível localizar o livro."
        );
      }

      if ((livro.quantidade ?? 0) <= 0) {
        throw new Error(
          "Não há exemplares disponíveis deste livro."
        );
      }

      /*
       * 2. Cria o empréstimo.
       */

      const { error: erroEmprestimo } =
        await supabase
          .from("emprestimos")
          .insert({
            livro_id: reservaSelecionada.livro_id,
            sala: reservaSelecionada.sala,
            data_emprestimo:
              new Date()
                .toISOString()
                .split("T")[0],
            data_prevista: dataPrevista,
            devolvido: false,
          });

      if (erroEmprestimo) {
        throw erroEmprestimo;
      }

      /*
       * 3. Diminui a quantidade do livro.
       */

      const novaQuantidade =
        (livro.quantidade ?? 0) - 1;

      const { error: erroEstoque } =
        await supabase
          .from("livros")
          .update({
            quantidade: novaQuantidade,
          })
          .eq("id", reservaSelecionada.livro_id);

      if (erroEstoque) {
        throw erroEstoque;
      }

      /*
       * 4. Marca a reserva como atendida.
       */

      const { error: erroReserva } =
        await supabase
          .from("reservas")
          .update({
            atendida: true,
          })
          .eq("id", reservaSelecionada.id);

      if (erroReserva) {
        throw erroReserva;
      }

      alert(
        "📚 Reserva atendida com sucesso!\n\nO empréstimo foi criado e o exemplar foi retirado do estoque."
      );

      fecharModal();
      buscarReservas();

    } catch (error: any) {
      console.log(error);

      alert(
        error?.message ||
          "Erro ao atender a reserva."
      );

    } finally {
      setProcessando(false);
    }
  }

  async function excluirReserva(id: number) {
    const reserva = reservas.find(
      (item) => item.id === id
    );

    const confirmar = confirm(
      `Deseja excluir a reserva de "${reserva?.livros?.nome || "este livro"}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("reservas")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao excluir a reserva.");
      console.log(error);
      return;
    }

    buscarReservas();
  }

  const total = reservas.length;

  const pendentes = reservas.filter(
    (reserva) => !reserva.atendida
  ).length;

  const atendidas = reservas.filter(
    (reserva) => reserva.atendida
  ).length;

  const reservasFiltradas = reservas.filter(
    (reserva) => {
      if (filtro === "pendentes") {
        return !reserva.atendida;
      }

      if (filtro === "atendidas") {
        return reserva.atendida;
      }

      return true;
    }
  );

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
                  Reservas
                </h1>

                <p className="text-blue-100 mt-2 max-w-2xl">
                  Acompanhe as reservas dos livros e
                  transforme uma solicitação em empréstimo.
                </p>

              </div>

              <div className="hidden sm:flex bg-white/10 border border-white/10 rounded-3xl px-7 py-5 text-center">

                <p className="text-3xl font-extrabold">
                  {pendentes}
                </p>

                <p className="text-xs text-blue-100 mt-1">
                  pendentes
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* INDICADORES */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <button
            type="button"
            onClick={() => setFiltro("todas")}
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
                filtro === "todas"
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-100"
              }
            `}
          >

            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              📌
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Total
            </p>

            <p className="text-3xl font-extrabold text-blue-700 mt-1">
              {total}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              reservas registradas
            </p>

          </button>

          <button
            type="button"
            onClick={() => setFiltro("pendentes")}
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
                filtro === "pendentes"
                  ? "border-purple-500 ring-2 ring-purple-100"
                  : "border-gray-100"
              }
            `}
          >

            <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center text-xl">
              ⏳
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Pendentes
            </p>

            <p className="text-3xl font-extrabold text-purple-600 mt-1">
              {pendentes}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              aguardando atendimento
            </p>

          </button>

          <button
            type="button"
            onClick={() => setFiltro("atendidas")}
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
                filtro === "atendidas"
                  ? "border-emerald-500 ring-2 ring-emerald-100"
                  : "border-gray-100"
              }
            `}
          >

            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
              ✓
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Atendidas
            </p>

            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              {atendidas}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              já transformadas em empréstimo
            </p>

          </button>

        </section>

        {/* FILTROS */}

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <h2 className="font-extrabold text-gray-800">
                Reservas
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Visualize e gerencie as solicitações do acervo.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() => setFiltro("todas")}
                className={`
                  px-4 py-2.5
                  rounded-xl
                  text-sm
                  font-bold
                  transition
                  ${
                    filtro === "todas"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                Todas
              </button>

              <button
                type="button"
                onClick={() => setFiltro("pendentes")}
                className={`
                  px-4 py-2.5
                  rounded-xl
                  text-sm
                  font-bold
                  transition
                  ${
                    filtro === "pendentes"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                Pendentes
              </button>

              <button
                type="button"
                onClick={() => setFiltro("atendidas")}
                className={`
                  px-4 py-2.5
                  rounded-xl
                  text-sm
                  font-bold
                  transition
                  ${
                    filtro === "atendidas"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                Atendidas
              </button>

            </div>

          </div>

        </section>

        {/* LISTAGEM */}

        {carregando ? (

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">

            <div className="text-5xl mb-4">
              📌
            </div>

            <p className="text-gray-500 font-semibold">
              Carregando reservas...
            </p>

          </div>

        ) : reservasFiltradas.length === 0 ? (

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 md:p-16 text-center">

            <div className="text-6xl mb-5">
              {filtro === "pendentes"
                ? "🎉"
                : "📌"}
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">

              {filtro === "pendentes"
                ? "Nenhuma reserva pendente!"
                : "Nenhuma reserva encontrada"}

            </h2>

            <p className="text-gray-500 mt-2">

              {filtro === "pendentes"
                ? "Não há solicitações aguardando atendimento."
                : "Não existem registros para este filtro."}

            </p>

          </div>

        ) : (

          <section className="space-y-4">

            <div>

              <h2 className="text-xl font-extrabold text-gray-800">
                Solicitações
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {reservasFiltradas.length} reserva(s) encontrada(s)
              </p>

            </div>

            {reservasFiltradas.map((reserva) => (

              <article
                key={reserva.id}
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
                      reserva.atendida
                        ? "bg-emerald-500"
                        : "bg-purple-600"
                    }
                  `}
                />

                <div className="p-5 md:p-6">

                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                    {/* LIVRO */}

                    <div className="flex items-center gap-4 min-w-0 flex-1">

                      <div className="w-20 h-24 rounded-2xl overflow-hidden bg-blue-50 shrink-0 shadow-sm">

                        {reserva.livros?.capa ? (

                          <img
                            src={reserva.livros.capa}
                            alt={reserva.livros.nome}
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
                          {reserva.livros?.nome}
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-3">

                          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold">
                            👶 {reserva.sala}
                          </span>

                          {reserva.atendida ? (

                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold">
                              ✓ Atendida
                            </span>

                          ) : (

                            <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold">
                              ⏳ Pendente
                            </span>

                          )}

                        </div>

                      </div>

                    </div>

                    {/* DATA */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-[330px]">

                      <div className="bg-gray-50 rounded-2xl p-4">

                        <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                          Data da reserva
                        </p>

                        <p className="text-sm font-bold text-gray-700 mt-1">
                          {reserva.data_reserva}
                        </p>

                      </div>

                      <div
                        className={`
                          rounded-2xl
                          p-4
                          ${
                            reserva.atendida
                              ? "bg-emerald-50"
                              : "bg-purple-50"
                          }
                        `}
                      >

                        <p
                          className={`
                            text-[10px]
                            uppercase
                            tracking-wide
                            font-bold
                            ${
                              reserva.atendida
                                ? "text-emerald-500"
                                : "text-purple-500"
                            }
                          `}
                        >
                          Situação
                        </p>

                        <p
                          className={`
                            text-sm
                            font-extrabold
                            mt-1
                            ${
                              reserva.atendida
                                ? "text-emerald-700"
                                : "text-purple-700"
                            }
                          `}
                        >
                          {reserva.atendida
                            ? "Concluída"
                            : "Aguardando"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* AÇÕES */}

                  <div className="mt-5 pt-5 border-t border-gray-100">

                    {reserva.atendida ? (

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <p className="text-sm text-emerald-600 font-semibold">
                          ✓ Esta reserva já foi atendida e transformada em empréstimo.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            excluirReserva(reserva.id)
                          }
                          className="
                            w-full
                            sm:w-auto
                            bg-gray-100
                            hover:bg-red-100
                            text-gray-600
                            hover:text-red-700
                            border border-gray-200
                            hover:border-red-200
                            px-5
                            py-3
                            rounded-xl
                            font-bold
                            transition
                          "
                        >
                          Excluir registro
                        </button>

                      </div>

                    ) : (

                      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            excluirReserva(reserva.id)
                          }
                          className="
                            w-full
                            sm:w-auto
                            bg-gray-100
                            hover:bg-red-100
                            text-gray-600
                            hover:text-red-700
                            border border-gray-200
                            hover:border-red-200
                            px-5
                            py-3
                            rounded-xl
                            font-bold
                            transition
                          "
                        >
                          Excluir
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            abrirAtendimento(reserva)
                          }
                          className="
                            w-full
                            sm:w-auto
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
                          ✓ Atender reserva
                        </button>

                      </div>

                    )}

                  </div>

                </div>

              </article>

            ))}

          </section>

        )}

      </div>

      {/* MODAL */}

      {modalAberto && reservaSelecionada && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden">

            <div className="bg-gradient-to-br from-[#1748d1] to-[#12358f] text-white p-6">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl">
                  📚
                </div>

                <div>

                  <p className="text-xs text-blue-100 font-bold uppercase tracking-wide">
                    Atender reserva
                  </p>

                  <h2 className="text-xl font-extrabold mt-1">
                    Criar empréstimo
                  </h2>

                </div>

              </div>

            </div>

            <div className="p-6 space-y-5">

              <div className="bg-blue-50 rounded-2xl p-4">

                <p className="text-xs uppercase tracking-wide text-blue-500 font-bold">
                  Livro
                </p>

                <p className="font-extrabold text-gray-800 mt-1">
                  {reservaSelecionada.livros?.nome}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  👶 Turma:{" "}
                  <strong>
                    {reservaSelecionada.sala}
                  </strong>
                </p>

              </div>

              <div>

                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📅 Data prevista para devolução
                </label>

                <input
                  type="date"
                  value={dataPrevista}
                  onChange={(e) =>
                    setDataPrevista(e.target.value)
                  }
                  disabled={processando}
                  className="
                    w-full
                    border border-gray-200
                    bg-gray-50
                    rounded-xl
                    px-4 py-3
                    text-gray-700
                    font-semibold
                    outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />

                <p className="text-xs text-gray-400 mt-2">
                  A data será registrada no novo empréstimo.
                </p>

              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">

                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={processando}
                  className="
                    flex-1
                    bg-gray-100
                    hover:bg-gray-200
                    disabled:opacity-50
                    text-gray-700
                    rounded-xl
                    py-3
                    font-bold
                  "
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={atenderReserva}
                  disabled={processando}
                  className="
                    flex-1
                    bg-emerald-600
                    hover:bg-emerald-700
                    disabled:bg-gray-400
                    text-white
                    rounded-xl
                    py-3
                    font-extrabold
                  "
                >
                  {processando
                    ? "Processando..."
                    : "Confirmar empréstimo"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}