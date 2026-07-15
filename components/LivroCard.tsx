"use client";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Livro } from "@/types/Livro";

interface LivroProps {
  livro: Livro;
}

export default function LivroCard({ livro }: LivroProps) {
  async function excluirLivro() {
    const confirmar = confirm(
      `Deseja excluir "${livro.nome}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("livros")
      .delete()
      .eq("id", livro.id);

    if (error) {
      alert("Erro ao excluir.");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

      {livro.capa ? (
        <Image
          src={livro.capa}
          alt={livro.nome}
          width={400}
          height={600}
          className="w-full h-80 object-cover"
        />
      ) : (
        <div className="w-full h-80 bg-gray-200 flex items-center justify-center text-6xl">
          📚
        </div>
      )}

      <div className="p-5">

        <h2 className="text-xl font-bold text-blue-700 line-clamp-2">
          {livro.nome}
        </h2>

        <p className="text-gray-500 mt-1">
          {livro.autor}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">

          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
            {livro.categoria || "Sem categoria"}
          </span>

          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            {livro.local || "-"}
          </span>

        </div>

        <div className="mt-4 text-sm text-gray-600">

          <p>👶 {livro.faixa_etaria || "-"}</p>

          <p className="mt-1">
            📦 {livro.quantidade} unidade(s)
          </p>

        </div>

        <div className="grid grid-cols-1 gap-3 mt-6">

          <Link
            href={`/emprestimos?livro=${livro.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-center font-semibold"
          >
            📤 Emprestar
          </Link>

          <div className="grid grid-cols-2 gap-3">

            <Link
              href={`/editar/${livro.id}`}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 text-center font-semibold"
            >
              ✏️ Editar
            </Link>

            <button
              onClick={excluirLivro}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 font-semibold"
            >
              🗑️ Excluir
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}