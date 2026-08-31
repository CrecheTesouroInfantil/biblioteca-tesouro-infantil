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
  const [tema, setTema] = useState("");
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [local, setLocal] = useState("");
  const [capa, setCapa] = useState("");

  const [salvando, setSalvando] = useState(false);

  async function salvarLivro() {
    if (!nome.trim()) {
      alert("Informe o nome do livro.");
      return;
    }

    if (!autor.trim()) {
      alert("Informe o autor.");
      return;
    }

    if (!categoria) {
      alert("Selecione uma categoria.");
      return;
    }

    if (!faixaEtaria) {
      alert("Selecione a faixa etária.");
      return;
    }

    if (!local) {
      alert("Selecione a caixa onde o livro ficará guardado.");
      return;
    }

    if (quantidade < 1) {
      alert("A quantidade deve ser pelo menos 1.");
      return;
    }

    setSalvando(true);

    try {
      const { data, error } = await supabase
        .from("livros")
        .insert([
          {
            nome: nome.trim(),
            autor: autor.trim(),
            categoria,
            tema: tema.trim(),
            faixa_etaria: faixaEtaria,
            quantidade,
            local,
            capa,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const codigo = `LIV-${String(data.id).padStart(6, "0")}`;

      const { error: erroCodigo } = await supabase
        .from("livros")
        .update({
          codigo,
        })
        .eq("id", data.id);

      if (erroCodigo) {
        await supabase
          .from("livros")
          .delete()
          .eq("id", data.id);

        throw erroCodigo;
      }

      alert(
        `📚 Livro cadastrado com sucesso!\n\nCódigo: ${codigo}`
      );

      router.push("/biblioteca");
      router.refresh();

    } catch (error: any) {
      console.log(error);

      alert(
        error?.message ||
        "Erro ao cadastrar o livro."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-blue-50 py-6 md:py-10 px-4">

      <div className="w-full max-w-4xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl p-5 md:p-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

            <div>

              <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
                📚 Cadastrar Livro
              </h1>

              <p className="text-gray-500 mt-2">
                Adicione um novo livro ao acervo.
              </p>

            </div>

            <button
              type="button"
              onClick={() => router.push("/biblioteca")}
              disabled={salvando}
              className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-5 py-3 rounded-xl font-semibold"
            >
              ← Voltar
            </button>

          </div>

          <FormLivro
            codigo=""
            nome={nome}
            setNome={setNome}
            autor={autor}
            setAutor={setAutor}
            categoria={categoria}
            setCategoria={setCategoria}
            tema={tema}
            setTema={setTema}
            faixaEtaria={faixaEtaria}
            setFaixaEtaria={setFaixaEtaria}
            quantidade={quantidade}
            setQuantidade={setQuantidade}
            local={local}
            setLocal={setLocal}
            capa={capa}
            setCapa={setCapa}
          />

          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">

            <button
              type="button"
              onClick={() => router.push("/biblioteca")}
              disabled={salvando}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 rounded-xl py-3 font-bold"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={salvarLivro}
              disabled={salvando}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold text-lg"
            >
              {salvando
                ? "💾 Salvando..."
                : "💾 Salvar Livro"}
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}