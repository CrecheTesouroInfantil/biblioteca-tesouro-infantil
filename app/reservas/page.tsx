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

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);

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

  async function atenderReserva(id: number) {
    const confirmar = confirm(
      "Marcar esta reserva como atendida?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("reservas")
      .update({
        atendida: true,
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar reserva.");
      return;
    }

    buscarReservas();
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
      return;
    }

    buscarReservas();
  }

  return (
    <main className="p-8">

      <h1 className="text-4xl font-bold text-blue-700 mb-8">
        📌 Reservas
      </h1>

      {carregando ? (

        <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
          Carregando...
        </div>

      ) : reservas.length === 0 ? (

        <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-500">
          Nenhuma reserva encontrada.
        </div>

      ) : (

        <div className="space-y-6">

          {reservas.map((reserva) => (

            <div
              key={reserva.id}
              className="bg-white rounded-3xl shadow-lg p-6"
            >

              <h2 className="text-2xl font-bold text-blue-700">
                📚 {reserva.livros?.nome}
              </h2>

              <p className="mt-3">
                <strong>Turma:</strong> {reserva.sala}
              </p>

              <p>
                <strong>Data:</strong> {reserva.data_reserva}
              </p>

              <p className="mt-2">

                {reserva.atendida ? (

                  <span className="text-green-600 font-bold">
                    ✅ Atendida
                  </span>

                ) : (

                  <span className="text-orange-600 font-bold">
                    ⏳ Pendente
                  </span>

                )}

              </p>

              <div className="flex gap-4 mt-6">

                {!reserva.atendida && (

                  <button
                    onClick={() => atenderReserva(reserva.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                  >
                    ✅ Atender
                  </button>

                )}

                <button
                  onClick={() => excluirReserva(reserva.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
                >
                  🗑️ Excluir
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>
  );
}