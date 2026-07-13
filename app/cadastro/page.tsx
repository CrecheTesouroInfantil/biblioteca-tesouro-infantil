"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import UploadCapa from "@/components/UploadCapa";

const categorias = [
  "Literatura Infantil",
  "Histórias Bíblicas",
  "Animais",
  "Natureza",
  "Emoções",
  "Família",
  "Inclusão",
  "Alfabetização",
  "Datas Comemorativas",
];

const faixas = [
  "Berçário",
  "Maternal I",
  "Maternal II",
  "Pré-escola",
];

const locais = [
  "Caixa 1",
  "Caixa 2",
  "Caixa 3",
];

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

        <select
          className="w-full border rounded-lg p-3 mb-4"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Selecione a categoria</option>

          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="w-full border rounded-lg p-3 mb-4"
          value={faixaEtaria}
          onChange={(e) => setFaixaEtaria(e.target.value)}
        >
          <option value="">Selecione a faixa etária</option>

          {faixas.map((faixa) => (
            <option key={faixa} value={faixa}>
              {faixa}
            </option>
          ))}
        </select>

        <select
          className="w-full border rounded-lg p-3 mb-4"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
        >
          <option value="">Selecione a caixa</option>

          {locais.map((caixa) => (
            <option key={caixa} value={caixa}>
              {caixa}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="w-full border rounded-lg p-3 mb-4"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />

        <UploadCapa onUpload={setCapa} />

        {capa && (
          <img
            src={capa}
            alt="Prévia da capa"
            className="w-40 rounded-lg mx-auto my-4 rounded-xl shadow"
          />
        )}

        <input
          className="w-full border rounded-lg p-3 mb-6"
          placeholder="Ou cole uma URL da imagem (opcional)"
          value={capa}
          onChange={(e) => setCapa(e.target.value)}
        />

        <button
          onClick={salvarLivro}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg"
        >
          💾 Salvar Livro
        </button>

      </div>
    </main>
  );
}