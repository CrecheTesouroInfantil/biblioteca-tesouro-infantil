"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FormLivro from "@/components/FormLivro";

export default function CadastroLivro() {
  const router = useRouter();

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
      alert("Erro ao salvar.");
      console.log(error);
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-blue-50 flex justify-center py-10 px-4">

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          📚 Cadastrar Livro
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
          onClick={salvarLivro}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg"
        >
          💾 Salvar Livro
        </button>

      </div>

    </main>
  );
}