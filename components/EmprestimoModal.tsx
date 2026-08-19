"use client";

import { useEffect, useState } from "react";
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
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState<number | null>(null);
  const [nomeLivro, setNomeLivro] = useState("");

  useEffect(() => {
    if (aberto && livroId) {
      carregarLivro();
    }
  }, [aberto, livroId]);

  async function carregarLivro() {
    if (!livroId) return;

    const { data, error } = await supabase
      .from("livros")
      .select("quantidade,nome")
      .eq("id", livroId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setQuantidadeDisponivel(data.quantidade ?? 0);
    setNomeLivro(data.nome || "");
  }

  function fecharModal() {
    setSala("");
    setDataEmprestimo(hoje);
    setDataPrevista("");
    setQuantidadeDisponivel(null);
    setNomeLivro("");
    fechar();
  }

  async function emprestar() {
    if (!livroId) {
      alert("Livro inválido.");
      return;
    }

    if (!sala) {
      alert("Selecione uma turma.");
      return;
    }

    if (!dataEmprestimo) {
      alert("Informe a data do empréstimo.");
      return;
    }

    if (!dataPrevista) {
      alert("Informe a data prevista de devolução.");
      return;
    }

    if (dataPrevista < dataEmprestimo) {
      alert(
        "A data prevista de devolução não pode ser anterior à data do empréstimo."
      );
      return;
    }

    setSalvando(true);

    try {
      const { data: livro, error: erroLivro } = await supabase
        .from("livros")
        .select("quantidade,nome")
        .eq("id", livroId)
        .single();

      if (erroLivro) {
        throw erroLivro;
      }

      const quantidadeAtual = livro.quantidade ?? 0;

      if (quantidadeAtual <= 0) {
        alert(
          `O livro "${livro.nome}" não possui exemplares disponíveis.\n\nRealize uma reserva em vez de um empréstimo.`
        );

        setQuantidadeDisponivel(0);
        setSalvando(false);
        return;
      }

      const { error: erroAtualizar } = await supabase
        .from("livros")
        .update({
          quantidade: quantidadeAtual - 1,
        })
        .eq("id", livroId)
        .eq("quantidade", quantidadeAtual);

      if (erroAtualizar) {
        throw erroAtualizar;
      }

      const { error: erroEmprestimo } = await supabase
        .from("emprestimos")
        .insert({
          livro_id: livroId,
          sala,
          data_emprestimo: dataEmprestimo,
          data_prevista: dataPrevista,
          devolvido: false,
        });

      if (erroEmprestimo) {
        await supabase
          .from("livros")
          .update({
            quantidade: quantidadeAtual,
          })
          .eq("id", livroId);

        throw erroEmprestimo;
      }

      alert("📤 Empréstimo realizado com sucesso!");

      fecharModal();

      window.location.reload();

    } catch (error: any) {
      console.log(error);

      alert(
        error?.message ||
        "Erro ao realizar empréstimo."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      fechar={fecharModal}
      titulo="📤 Emprestar Livro"
    >
      {nomeLivro && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
          <p className="text-sm text-gray-500">
            Livro
          </p>

          <p className="font-bold text-blue-700 mt-1">
            📚 {nomeLivro}
          </p>

          {quantidadeDisponivel !== null && (
            <p className="text-sm text-green-600 font-semibold mt-2">
              📦 {quantidadeDisponivel} exemplar(es) disponível(is)
            </p>
          )}
        </div>
      )}

      <label className="block text-sm font-bold text-gray-700 mb-2">
        👶 Turma
      </label>

      <select
        className="w-full border rounded-xl p-3 mb-4"
        value={sala}
        onChange={(e) => setSala(e.target.value)}
        disabled={salvando}
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

      <label className="block text-sm font-bold text-gray-700 mb-2">
        📅 Data do empréstimo
      </label>

      <input
        type="date"
        className="w-full border rounded-xl p-3 mb-4"
        value={dataEmprestimo}
        onChange={(e) =>
          setDataEmprestimo(e.target.value)
        }
        disabled={salvando}
      />

      <label className="block text-sm font-bold text-gray-700 mb-2">
        📅 Data prevista para devolução
      </label>

      <input
        type="date"
        min={dataEmprestimo}
        className="w-full border rounded-xl p-3 mb-6"
        value={dataPrevista}
        onChange={(e) =>
          setDataPrevista(e.target.value)
        }
        disabled={salvando}
      />

      <button
        onClick={emprestar}
        disabled={
          salvando ||
          quantidadeDisponivel === 0
        }
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl py-3 font-bold"
      >
        {salvando
          ? "💾 Salvando..."
          : quantidadeDisponivel === 0
          ? "📕 Sem exemplares disponíveis"
          : "📤 Confirmar Empréstimo"}
      </button>

    </Modal>
  );
}