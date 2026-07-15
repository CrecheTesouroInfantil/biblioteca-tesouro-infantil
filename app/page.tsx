"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import Biblioteca from "@/components/Biblioteca";

export default function Home() {
  const [livros, setLivros] = useState<any[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    buscarLivros();

    const channel = supabase
      .channel("livros")
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

  const livrosFiltrados = livros.filter((livro) => {
    const texto = pesquisa.toLowerCase();

    return (
      livro.nome?.toLowerCase().includes(texto) ||
      livro.autor?.toLowerCase().includes(texto) ||
      livro.categoria?.toLowerCase().includes(texto) ||
      livro.local?.toLowerCase().includes(texto)
    );
  });

  const totalCategorias = new Set(
    livros.map((livro) => livro.categoria).filter(Boolean)
  ).size;

  const totalCaixas = new Set(
    livros.map((livro) => livro.local).filter(Boolean)
  ).size;

  const totalCapas = livros.filter((livro) => livro.capa).length;

  return (
    <main className="p-8">

      <Header
        pesquisa={pesquisa}
        setPesquisa={setPesquisa}
      />

      <Dashboard
        totalLivros={livros.length}
        totalCategorias={totalCategorias}
        totalCaixas={totalCaixas}
        totalCapas={totalCapas}
      />

      <Biblioteca
        livros={livrosFiltrados}
      />

    </main>
  );
}