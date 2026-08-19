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

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const [reservaSelecionada, setReservaSelecionada] =
    useState<Reserva | null>(null);

  const [dataPrevista, setDataPrevista] = useState("");
  const [salvando, setSalvando] = useState(false);

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
      .order("data_reserva", { ascending: false });

    if (error) {
      console.log(error);
      setCarregando(false);
      return;
    }

    setReservas((data as Reserva[]) || []);
    setCarregando(false);
  }

  function abrirAtendimento(reserva: Reserva) {
    const hoje = new Date().toISOString().split("T")[0];

    setReservaSelecionada(reserva);
    setDataPrevista(hoje);
  }

  function fecharAtendimento() {
    if (salvando) return;

    setReservaSelecionada(null);
    setDataPrevista("");
  }

  async function confirmarAtendimento() {
    if (!reservaSelecionada) return;

    if (!dataPrevista) {
      alert("Informe a data prevista de devolução.");
      return;
    }

    setSalvando(true);

    try {
      /*
       * 1. Busca o estoque atual do livro
       */
      const { data: livro, error: erroLivro } = await supabase
        .from("livros")
        .select("quantidade,nome")
        .eq("id", reservaSelecionada.livro_id)
        .single();

      if (erroLivro) {
        throw erroLivro;
      }

      const quantidadeAtual = livro?.quantidade ?? 0;

      /*
       * 2. Confirma que existe exemplar disponível
       */
      if (quantidadeAtual <= 0) {
        alert(
          `O livro "${livro?.nome}" está sem exemplares disponíveis no momento.`
        );

        setSalvando(false);
        return;
      }

      /*
       * 3. Cria o empréstimo
       */
      const hoje = new Date().toISOString().split("T")[0];

      const { error: erroEmprestimo } = await supabase
        .from("emprestimos")
        .insert({
          livro_id: reservaSelecionada.livro_id,
          sala: reservaSelecionada.sala,
          data_emprestimo: hoje,
          data_prevista: dataPrevista,
          devolvido: false,
        });

      if (erroEmprestimo) {
        throw erroEmprestimo;
      }

      /*
       * 4. Diminui o estoque
       */
      const { error: erroEstoque } = await supabase
        .from("livros")
        .update({
          quantidade: quantidadeAtual - 1,
        })
        .eq("id", reservaSelecionada.livro_id);

      if (erroEstoque) {
        throw erroEstoque;
      }

      /*
       * 5. Marca a reserva como atendida
       */
      const { error: erroReserva } = await supabase
        .from("reservas")
        .update({
          atendida: true,
        })
        .eq("id", reservaSelecionada.id);

      if (erroReserva) {
        throw erroReserva;
      }

      alert(
        `📚 Empréstimo realizado com sucesso!\n\n` +
        `Livro: ${reservaSelecionada.livros?.nome}\n` +
        `Turma: ${reservaSelecionada.sala}\n` +
        `Devolução prevista: ${dataPrevista}`
      );

      fecharAtendimento();
      buscarReservas();

    } catch (error: any) {
      console.log(error);

      alert(
        error?.message ||
        "Erro ao atender a reserva."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirReserva(id: number) {
    const confirmar = confirm(
      "Deseja excluir esta reserva?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("reservas")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao excluir.");
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

  const reservasFiltradas = reservas.filter((reserva) => {

    if (filtro === "pendentes") {
      return !reserva.atendida;
    }

    if (filtro === "atendidas") {
      return reserva.atendida;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* CABEÇALHO */}

        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            📌 Reservas
          </h1>

          <p className="text-gray-500 mt-2">
            Controle das reservas de livros
          </p>

        </div>

        {/* RESUMO */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <button
            onClick={() => setFiltro("todas")}
            className={`bg-white rounded-2xl shadow-lg p-5 text-left transition ${
              filtro === "todas"
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
              📌 reservas
            </p>

          </button>

          <button
            onClick={() => setFiltro("pendentes")}
            className={`bg-white rounded-2xl shadow-lg p-5 text-left transition ${
              filtro === "pendentes"
                ? "ring-2 ring-orange-500"
                : ""
            }`}
          >

            <p className="text-gray-500 text-sm">
              Pendentes
            </p>

            <p className="text-3xl font-bold text-orange-600 mt-1">
              {pendentes}
            </p>

            <p className="text-sm mt-1">
              ⏳ aguardando atendimento
            </p>

          </button>

          <button
            onClick={() => setFiltro("atendidas")}
            className={`bg-white rounded-2xl shadow-lg p-5 text-left transition ${
              filtro === "atendidas"
                ? "ring-2 ring-green-600"
                : ""
            }`}
          >

            <p className="text-gray-500 text-sm">
              Atendidas
            </p>

            <p className="text-3xl font-bold text-green-600 mt-1">
              {atendidas}
            </p>

            <p className="text-sm mt-1">
              ✅ finalizadas
            </p>

          </button>

        </div>

        {/* FILTROS */}

        <div className="flex flex-wrap gap-2 mb-6">

          <button
            onClick={() => setFiltro("todas")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filtro === "todas"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setFiltro("pendentes")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filtro === "pendentes"
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            ⏳ Pendentes
          </button>

          <button
            onClick={() => setFiltro("atendidas")}
            className={`px-4 py-2 rounded-xl font-semibold ${
              filtro === "atendidas"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            ✅ Atendidas
          </button>

        </div>

        {/* LISTA */}

        {carregando ? (

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
            Carregando...
          </div>

        ) : reservasFiltradas.length === 0 ? (

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-500">

            {filtro === "pendentes"
              ? "🎉 Nenhuma reserva pendente!"
              : filtro === "atendidas"
              ? "Nenhuma reserva atendida."
              : "Nenhuma reserva encontrada."}

          </div>

        ) : (

          <div className="space-y-5">

            {reservasFiltradas.map((reserva) => (

              <div
                key={reserva.id}
                className={`bg-white rounded-3xl shadow-lg p-5 md:p-6 border-l-8 ${
                  reserva.atendida
                    ? "border-green-500"
                    : "border-orange-500"
                }`}
              >

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                  <div className="min-w-0">

                    <h2 className="text-xl md:text-2xl font-bold text-blue-700 break-words">
                      📚 {reserva.livros?.nome}
                    </h2>

                    <div className="mt-4 space-y-1 text-gray-700">

                      <p>
                        <strong>👶 Turma:</strong>{" "}
                        {reserva.sala}
                      </p>

                      <p>
                        <strong>📅 Data da reserva:</strong>{" "}
                        {reserva.data_reserva}
                      </p>

                    </div>

                  </div>

                  <div className="shrink-0">

                    {reserva.atendida ? (

                      <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
                        ✅ Atendida
                      </span>

                    ) : (

                      <span className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold">
                        ⏳ Pendente
                      </span>

                    )}

                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-5">

                  {!reserva.atendida && (

                    <button
                      onClick={() => abrirAtendimento(reserva)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      ✅ Atender reserva
                    </button>

                  )}

                  <button
                    onClick={() => excluirReserva(reserva.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold"
                  >
                    🗑️ Excluir
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* MODAL DE ATENDIMENTO */}

      {reservaSelecionada && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">

            <h2 className="text-2xl font-bold text-blue-700">
              📚 Atender reserva
            </h2>

            <div className="mt-5 space-y-3">

              <div className="bg-blue-50 rounded-2xl p-4">

                <p>
                  <strong>Livro:</strong>{" "}
                  {reservaSelecionada.livros?.nome}
                </p>

                <p className="mt-1">
                  <strong>Turma:</strong>{" "}
                  {reservaSelecionada.sala}
                </p>

              </div>

              <label className="block font-bold text-gray-700">
                📅 Data prevista para devolução
              </label>

              <input
                type="date"
                value={dataPrevista}
                onChange={(e) =>
                  setDataPrevista(e.target.value)
                }
                className="w-full border rounded-xl p-3"
              />

            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <button
                onClick={fecharAtendimento}
                disabled={salvando}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl py-3 font-bold"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarAtendimento}
                disabled={salvando}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl py-3 font-bold"
              >
                {salvando
                  ? "Salvando..."
                  : "📤 Confirmar empréstimo"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}