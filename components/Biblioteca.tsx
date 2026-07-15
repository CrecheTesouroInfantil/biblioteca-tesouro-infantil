"use client";

import { useState } from "react";
import LivroCard from "./LivroCard";
import EmprestimoModal from "./EmprestimoModal";

interface BibliotecaProps {
  livros: any[];
}

export default function Biblioteca({
  livros,
}: BibliotecaProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState<number | null>(null);

  function abrirEmprestimo(id: number) {
    setLivroSelecionado(id);
    setModalAberto(true);
  }

  if (livros.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-500">
        Nenhum livro encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {livros.map((livro) => (
          <LivroCard
            key={livro.id}
            livro={livro}
            onEmprestar={abrirEmprestimo}
          />
        ))}
      </div>

      <EmprestimoModal
        aberto={modalAberto}
        fechar={() => setModalAberto(false)}
        livroId={livroSelecionado}
      />
    </>
  );
}