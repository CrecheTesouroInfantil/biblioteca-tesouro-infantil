"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import Header from "@/components/Header";
import Biblioteca from "@/components/Biblioteca";

export default function BibliotecaPage() {
  const [livros, setLivros] = useState<any[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    buscarLivros();

    const channel = supabase
      .channel("livros-publicos")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "livros",
        },
        () => buscarLivros()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const textoPesquisa = pesquisa
    .toLowerCase()
    .trim();

  const livrosFiltrados = livros.filter((livro) => {
    if (!textoPesquisa) {
      return true;
    }

    return (
      livro.nome?.toLowerCase().includes(textoPesquisa) ||
      livro.autor?.toLowerCase().includes(textoPesquisa) ||
      livro.categoria?.toLowerCase().includes(textoPesquisa) ||
      livro.local?.toLowerCase().includes(textoPesquisa) ||
      livro.faixa_etaria?.toLowerCase().includes(textoPesquisa) ||
      livro.codigo?.toLowerCase().includes(textoPesquisa) ||
      String(livro.id).includes(textoPesquisa)
    );
  });

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8 text-center">

          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700">
            📚 Biblioteca Tesouro Infantil
          </h1>

          <p className="text-gray-500 mt-2">
            Consulte nosso acervo e veja a disponibilidade dos livros.
          </p>

        </div>

        <Header
          pesquisa={pesquisa}
          setPesquisa={setPesquisa}
          publico={true}
        />

        <div className="mb-5">

          {textoPesquisa ? (

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-blue-700 font-semibold">

              🔎 Encontrados{" "}
              <strong>
                {livrosFiltrados.length}
              </strong>{" "}
              livro(s) para:

              <span className="font-bold">
                {" "}
                "{pesquisa}"
              </span>

            </div>

          ) : (

            <div className="text-gray-500 text-sm">
              📚 Exibindo todos{" "}
              <strong>
                {livros.length}
              </strong>{" "}
              livro(s) cadastrados.
            </div>

          )}

        </div>

        <Biblioteca
          livros={livrosFiltrados}
          publico={true}
        />

      </div>

    </main>
  );
}