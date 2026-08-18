"use client";

import { useState } from "react";
import Modal from "./Modal";
import { supabase } from "@/lib/supabase";

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
  const [salvando, setSalvando] = useState(false);

  async function emprestar() {
    if (!livroId) {
      alert("Livro inválido.");
      return;
    }

    if (!sala) {
      alert("Selecione uma turma.");
      return;
    }

    if (!dataPrevista) {
      alert("Informe a data prevista de devolução.");
      return;
    }

    setSalvando(true);

    try {
      // Busca o livro
      const { data: livro, error: erroLivro } = await supabase
        .from("livros")
        .select("quantidade,nome")
        .eq("id", livroId)
        .single();

      if (erroLivro) throw erroLivro;

      const quantidadeAtual = livro.quantidade ?? 0;

      // BLOQUEIA NOVO EMPRÉSTIMO
      if (quantidadeAtual <= 0) {
        alert(
          `O livro "${livro.nome}" não possui exemplares disponíveis.\n\nRealize uma reserva em vez de um empréstimo.`
        );
        setSalvando(false);
        return;
      }

      // Salva empréstimo
      const { error } = await supabase
        .from("emprestimos")
        .insert({
          livro_id: livroId,
          sala,
          data_emprestimo: dataEmprestimo,
          data_prevista: dataPrevista,
          devolvido: false,
        });

      if (error) throw error;

      // Atualiza quantidade
      const { error: erroAtualizar } = await supabase
        .from("livros")
        .update({
          quantidade: quantidadeAtual - 1,
        })
        .eq("id", livroId);

      if (erroAtualizar) throw erroAtualizar;

      alert("Empréstimo realizado com sucesso!");

      setSala("");
      setDataEmprestimo(hoje);
      setDataPrevista("");

      fechar();

      window.location.reload();

    } catch (error: any) {
      console.log(error);

      alert(
        error.message ??
        "Erro ao realizar empréstimo."
      );
    }

    setSalvando(false);
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
        <option value="">
          Selecione a turma
        </option>

        {salas.map((item) => (
          <option
            key={item}
            value={item}
          >
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
        disabled={salvando}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl py-3 font-bold"
      >
        {salvando
          ? "Salvando..."
          : "📤 Confirmar Empréstimo"}
      </button>

    </Modal>
  );
}