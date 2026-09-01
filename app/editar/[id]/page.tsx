"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FormLivro from "@/components/FormLivro";

export default function EditarLivro() {
  const { id } = useParams();
  const router = useRouter();

  const [codigo, setCodigo] = useState("");

  const [nome, setNome] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [faixaEtaria, setFaixaEtaria] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [local, setLocal] = useState("");
  const [capa, setCapa] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarLivro();
  }, [id]);

  async function buscarLivro() {
    if (!id) return;

    setCarregando(true);

    const { data, error } = await supabase
      .from("livros")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      alert("Não foi possível carregar o livro.");
      setCarregando(false);
      return;
    }

    setCodigo(data.codigo || "");
    setNome(data.nome || "");
    setAutor(data.autor || "");
    setCategoria(data.categoria || "");
    setFaixaEtaria(data.faixa_etaria || "");
    setQuantidade(Math.max(data.quantidade ?? 1, 1));
    setLocal(data.local || "");
    setCapa(data.capa || "");

    setCarregando(false);
  }

  async function salvarAlteracoes() {
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
      const { error } = await supabase
        .from("livros")
        .update({
          nome: nome.trim(),
          autor: autor.trim(),
          categoria,
          faixa_etaria: faixaEtaria,
          quantidade,
          local,
          capa,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      alert("Livro atualizado com sucesso!");

      router.push("/biblioteca");
      router.refresh();

    } catch (error: any) {
      console.log(error);

      alert(
        error?.message ||
        "Erro ao atualizar o livro."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirLivro() {
    const confirmar = window.confirm(
      `Deseja realmente excluir o livro "${nome}"?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    setSalvando(true);

    try {
      const { error } = await supabase
        .from("livros")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      alert("Livro excluído com sucesso!");

      router.push("/biblioteca");
      router.refresh();

    } catch (error: any) {
      console.log(error);

      alert(
        error?.message ||
        "Erro ao excluir o livro."
      );

      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-blue-50 flex items-center justify-center p-6">

        <div className="bg-white rounded-3xl shadow-lg p-10 text-center">

          <p className="text-lg font-semibold text-gray-600">
            📚 Carregando livro...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50 py-6 md:py-10 px-4">

      <div className="w-full max-w-4xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl p-5 md:p-8">

          {/* CABEÇALHO */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

            <div>

              <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
                ✏️ Editar Livro
              </h1>

              <p className="text-gray-500 mt-2">
                Atualize as informações do livro.
              </p>

            </div>

            <button
              type="button"
              onClick={() => router.push("/biblioteca")}
              disabled={salvando}
              className="
                bg-gray-100
                hover:bg-gray-200
                disabled:opacity-50
                text-gray-700
                px-5
                py-3
                rounded-xl
                font-semibold
              "
            >
              ← Voltar
            </button>

          </div>

          {/* FORMULÁRIO */}

          <FormLivro
            codigo={codigo}
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

          {/* BOTÕES */}

          <div className="mt-8 space-y-3">

            <div className="flex flex-col-reverse sm:flex-row gap-3">

              <button
                type="button"
                onClick={() => router.push("/biblioteca")}
                disabled={salvando}
                className="
                  flex-1
                  bg-gray-200
                  hover:bg-gray-300
                  disabled:opacity-50
                  text-gray-700
                  rounded-xl
                  py-3
                  font-bold
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarAlteracoes}
                disabled={salvando}
                className="
                  flex-1
                  bg-blue-600
                  hover:bg-blue-700
                  disabled:bg-gray-400
                  text-white
                  rounded-xl
                  py-3
                  font-bold
                  text-lg
                "
              >
                {salvando
                  ? "💾 Salvando..."
                  : "💾 Salvar Alterações"}
              </button>

            </div>

            {/* EXCLUIR */}

            <button
              type="button"
              onClick={excluirLivro}
              disabled={salvando}
              className="
                w-full
                bg-red-50
                hover:bg-red-100
                disabled:opacity-50
                text-red-700
                border
                border-red-200
                rounded-xl
                py-3
                font-bold
                transition
              "
            >
              🗑️ Excluir este livro
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}