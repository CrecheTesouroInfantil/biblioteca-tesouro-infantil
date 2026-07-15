"use client";

import { useState } from "react";
import Modal from "./Modal";

interface EmprestimoModalProps {
  aberto: boolean;
  fechar: () => void;
  livroId: number | null;
}

const salas = [
  "BERÇÁRIO",
  "MATERNAL I",
  "MATERNAL II",
  "CONTRA TURNO",
  "PRÉ ESCOLAR",
];

export default function EmprestimoModal({
  aberto,
  fechar,
  livroId,
}: EmprestimoModalProps) {
  const hoje = new Date().toISOString().split("T")[0];

  const [sala, setSala] = useState("");
  const [dataEmprestimo, setDataEmprestimo] = useState(hoje);
  const [dataPrevista, setDataPrevista] = useState("");

  async function emprestar() {
    // No próximo passo vamos salvar no Supabase.
    alert(
      `Livro ${livroId}\nSala: ${sala}\nEmpréstimo: ${dataEmprestimo}\nPrevista: ${dataPrevista}`
    );

    fechar();
  }

  return (
    <Modal
      aberto={aberto}
      fechar={fechar}
      titulo="📤 Emprestar Livro"
    >
      <select
        className="w-full border rounded-xl p-3 mb-4"
        value={sala}
        onChange={(e) => setSala(e.target.value)}
      >
        <option value="">Selecione a sala</option>

        {salas.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="w-full border rounded-xl p-3 mb-4"
        value={dataEmprestimo}
        onChange={(e) => setDataEmprestimo(e.target.value)}
      />

      <input
        type="date"
        className="w-full border rounded-xl p-3 mb-6"
        value={dataPrevista}
        onChange={(e) => setDataPrevista(e.target.value)}
      />

      <button
        onClick={emprestar}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold"
      >
        📤 Confirmar Empréstimo
      </button>
    </Modal>
  );
}