"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FormLivro from "@/components/FormLivro";

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
      console.log(error);
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-blue-50 flex justify-center py-10 px-4">

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          ✏️ Editar Livro
        </h1>

        <FormLivro
          nome={nome}
          setNome={setNome}
          autor={autor}
          setAutor={setAutor}
          categoria={categoria}
          setCategoria={setCategoria}
          faixaEtaria={faixaEtaria}
          setFaixaEtaria={setFaixaEtaria}
          quantidade={quantidade}
          setQuantidade={setQuantidade}
          local={local}
          setLocal={setLocal}
          capa={capa}
          setCapa={setCapa}
        />

        <button
          onClick={salvarAlteracoes}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold text-lg"
        >
          💾 Salvar Alterações
        </button>

      </div>

    </main>
  );
}