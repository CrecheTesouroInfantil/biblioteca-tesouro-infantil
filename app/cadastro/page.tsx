"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CadastroLivro() {
  const [nome, setNome] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [local, setLocal] = useState("");
  const [capa, setCapa] = useState("");

  async function salvarLivro() {
    const { error } = await supabase.from("livros").insert([
      {
        nome,
        autor,
        categoria,
        faixa_etaria: faixaEtaria,
        quantidade,
        local,
        capa,
      },
    ]);

    if (error) {
      alert("Erro ao salvar!");
      console.log(error);
      return;
    }

    alert("Livro cadastrado com sucesso!");

    setNome("");
    setAutor("");
    setCategoria("");
    setFaixaEtaria("");
    setQuantidade(1);
    setLocal("");
    setCapa("");
  }

  return (
    <main className="min-h-screen bg-blue-50 flex justify-center py-10 px-4">

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          📚 Cadastrar Livro
        </h1>

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Nome do livro"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Autor"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Faixa etária"
          value={faixaEtaria}
          onChange={(e) => setFaixaEtaria(e.target.value)}
        />

        <input
          type="number"
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Local (Ex.: Caixa 1)"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3 mb-6"
          placeholder="URL da capa"
          value={capa}
          onChange={(e) => setCapa(e.target.value)}
        />

        <button
          onClick={salvarLivro}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full py-3 font-bold"
        >
          💾 Salvar Livro
        </button>

      </div>

    </main>
  );
}