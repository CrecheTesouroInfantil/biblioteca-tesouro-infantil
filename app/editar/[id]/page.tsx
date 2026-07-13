"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditarLivro() {
  const { id } = useParams();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [local, setLocal] = useState("");
  const [capa, setCapa] = useState("");

  useEffect(() => {
    buscarLivro();
  }, []);

  async function buscarLivro() {
    const { data, error } = await supabase
      .from("livros")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setNome(data.nome || "");
    setAutor(data.autor || "");
    setCategoria(data.categoria || "");
    setFaixaEtaria(data.faixa_etaria || "");
    setQuantidade(data.quantidade || 1);
    setLocal(data.local || "");
    setCapa(data.capa || "");
  }

  async function salvarAlteracoes() {
    const { error } = await supabase
      .from("livros")
      .update({
        nome,
        autor,
        categoria,
        faixa_etaria: faixaEtaria,
        quantidade,
        local,
        capa,
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar.");
      return;
    }

    alert("Livro atualizado com sucesso!");
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-blue-50 flex justify-center py-10">

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          ✏️ Editar Livro
        </h1>

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Nome"
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
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />

        <input
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="Local"
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
          onClick={salvarAlteracoes}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-bold"
        >
          💾 Salvar Alterações
        </button>

      </div>

    </main>
  );
}