"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LivroCard from "@/components/LivroCard";

export default function Home() {
  const [livros, setLivros] = useState<any[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    buscarLivros();
  }, []);

  async function buscarLivros() {
    const { data, error } = await supabase
      .from("livros")
      .select("*")
      .order("nome");

    if (error) {
      console.log(error);
      return;
    }

    setLivros(data || []);
  }

  const livrosFiltrados = livros.filter((livro) => {
    const texto = pesquisa.toLowerCase();

    return (
      livro.nome?.toLowerCase().includes(texto) ||
      livro.autor?.toLowerCase().includes(texto) ||
      livro.categoria?.toLowerCase().includes(texto)
    );
  });

  return (
    <main className="min-h-screen bg-blue-50 py-10 px-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold text-center text-blue-700">
          📚 Biblioteca Tesouro Infantil
        </h1>

        <p className="text-center text-gray-600 mt-3 mb-8">
          Consulte todo o acervo da creche.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">

          <input
            type="text"
            placeholder="🔎 Pesquise pelo nome, autor ou categoria..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="flex-1 rounded-xl border p-4"
          />

          <Link
            href="/cadastro"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 font-bold text-center"
          >
            ➕ Novo Livro
          </Link>

        </div>

        <p className="mb-6 text-gray-600 font-semibold">
          📚 {livrosFiltrados.length} livro(s) cadastrado(s)
        </p>

        {livrosFiltrados.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-10 text-center">
            Nenhum livro encontrado.
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {livrosFiltrados.map((livro) => (
              <LivroCard
                key={livro.id}
                livro={livro}
              />
            ))}

          </div>

        )}

      </div>

    </main>
  );
}