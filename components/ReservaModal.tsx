"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { supabase } from "@/lib/supabase";

interface ReservaModalProps {
  aberto: boolean;
  fechar: () => void;
  livroId: number | null;
}

interface Turma {
  id: number;
  nome: string;
}

export default function ReservaModal({
  aberto,
  fechar,
  livroId,
}: ReservaModalProps) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [sala, setSala] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarTurmas();
  }, []);

  async function buscarTurmas() {
    const { data, error } = await supabase
      .from("turmas")
      .select("*")
      .order("nome");

    if (error) {
      console.log(error);
      return;
    }

    setTurmas(data || []);
  }

  async function reservar() {
    if (!livroId) {
      alert("Livro inválido.");
      return;
    }

    if (!sala) {
      alert("Selecione uma turma.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase
      .from("reservas")
      .insert({
        livro_id: livroId,
        sala,
      });

    setSalvando(false);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    alert("Reserva realizada com sucesso!");

    setSala("");
    fechar();

    window.location.reload();
  }

  return (
    <Modal
      aberto={aberto}
      fechar={fechar}
      titulo="📌 Reservar Livro"
    >

      <select
        className="w-full border rounded-xl p-3 mb-6"
        value={sala}
        onChange={(e) => setSala(e.target.value)}
      >

        <option value="">
          Selecione a turma
        </option>

        {turmas.map((turma) => (
          <option
            key={turma.id}
            value={turma.nome}
          >
            {turma.nome}
          </option>
        ))}

      </select>

      <button
        onClick={reservar}
        disabled={salvando}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-xl py-3 font-bold"
      >
        {salvando
          ? "Salvando..."
          : "📌 Confirmar Reserva"}
      </button>

    </Modal>
  );
}