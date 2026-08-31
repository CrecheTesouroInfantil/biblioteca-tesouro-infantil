"use client";

import { useState } from "react";
import LivroCard from "./LivroCard";
import EmprestimoModal from "./EmprestimoModal";
import ReservaModal from "./ReservaModal";

interface BibliotecaProps {
  livros: any[];
  publico?: boolean;
  tamanho?: "pequeno" | "medio" | "grande";
}

export default function Biblioteca({
  livros,
  publico = false,
  tamanho = "medio",
}: BibliotecaProps) {
  const [modalEmprestimo, setModalEmprestimo] = useState(false);
  const [modalReserva, setModalReserva] = useState(false);

  const [livroSelecionado, setLivroSelecionado] = useState<number | null>(
    null
  );

  function abrirEmprestimo(id: number) {
    setLivroSelecionado(id);
    setModalEmprestimo(true);
  }

  function abrirReserva(id: number) {
    setLivroSelecionado(id);
    setModalReserva(true);
  }

  function fecharEmprestimo() {
    setModalEmprestimo(false);
    setLivroSelecionado(null);
  }

  function fecharReserva() {
    setModalReserva(false);
    setLivroSelecionado(null);
  }

  if (livros.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-500">
        Nenhum livro encontrado.
      </div>
    );
  }

  const classeGrade =
    tamanho === "pequeno"
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5"
      : tamanho === "grande"
      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8";

  return (
    <>
      <div className={classeGrade}>

        {livros.map((livro) => (
          <LivroCard
            key={livro.id}
            livro={livro}
            publico={publico}
            onEmprestar={abrirEmprestimo}
            onReservar={abrirReserva}
          />
        ))}

      </div>

      {!publico && (
        <EmprestimoModal
          aberto={modalEmprestimo}
          fechar={fecharEmprestimo}
          livroId={livroSelecionado}
        />
      )}

      <ReservaModal
        aberto={modalReserva}
        fechar={fecharReserva}
        livroId={livroSelecionado}
      />
    </>
  );
}