"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import EmprestimosDashboard from "@/components/EmprestimosDashboard";

interface Emprestimo {
  id: number;
  livro_id: number;
  sala: string;
  data_emprestimo: string;
  data_prevista: string;
  data_devolucao: string | null;
  devolvido: boolean;
  livros: {
    nome: string;
    capa: string;
    quantidade: number;
  };
}

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    buscarEmprestimos();
  }, []);

  async function buscarEmprestimos() {
    const { data, error } = await supabase
      .from("emprestimos")
      .select(`
        *,
        livros (
          nome,
          capa,
          quantidade
        )
      `)
      .order("data_emprestimo", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setEmprestimos((data as Emprestimo[]) || []);
  }

  async function devolverLivro(item: Emprestimo) {
    if (!confirm(`Deseja devolver "${item.livros.nome}"?`)) return;

    const { error } = await supabase
      .from("emprestimos")
      .update({
        devolvido: true,
        data_devolucao: new Date().toISOString().split("T")[0],
      })
      .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase
      .from("livros")
      .update({
        quantidade: (item.livros.quantidade ?? 0) + 1,
      })
      .eq("id", item.livro_id);

    buscarEmprestimos();
  }

  const hoje = new Date();

  const lista = emprestimos.filter((item) => {
    const texto = pesquisa.toLowerCase();

    return (
      item.livros?.nome?.toLowerCase().includes(texto) ||
      item.sala?.toLowerCase().includes(texto)
    );
  });

  const emprestados = emprestimos.filter((e) => !e.devolvido).length;
  const devolvidos = emprestimos.filter((e) => e.devolvido).length;

  const atrasados = emprestimos.filter((e) => {
    if (e.devolvido) return false;
    return new Date(e.data_prevista) < hoje;
  }).length;

  return (
    <main className="p-8">

      <h1 className="text-4xl font-bold text-blue-700 mb-8">
        📤 Empréstimos
      </h1>

      <EmprestimosDashboard
        total={emprestimos.length}
        emprestados={emprestados}
        devolvidos={devolvidos}
        atrasados={atrasados}
      />

      <input
        type="text"
        placeholder="🔎 Pesquisar por livro ou sala..."
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        className="w-full border rounded-2xl p-4 mb-8"
      />

      {lista.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-500">
          Nenhum empréstimo encontrado.
        </div>
      ) : (
        <div className="space-y-5">

          {lista.map((item) => {

            const atrasado =
              !item.devolvido &&
              new Date(item.data_prevista) < hoje;

            return (

              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex gap-6"
              >

                <img
                  src={item.livros?.capa || "/sem-capa.png"}
                  alt={item.livros?.nome}
                  className="w-24 h-36 rounded-xl object-cover border"
                />

                <div className="flex-1">

                  <h2 className="text-2xl font-bold text-blue-700">
                    {item.livros.nome}
                  </h2>

                  <p className="mt-2">
                    🏫 <strong>{item.sala}</strong>
                  </p>

                  <p>
                    📅 Empréstimo: {item.data_emprestimo}
                  </p>

                  <p>
                    ⏰ Prevista: {item.data_prevista}
                  </p>

                  <div className="mt-4">

                    {item.devolvido ? (
                      <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                        ✅ Devolvido
                      </span>
                    ) : atrasado ? (
                      <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
                        ⏰ Atrasado
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                        📤 Emprestado
                      </span>
                    )}

                  </div>

                  {!item.devolvido && (

                    <button
                      onClick={() => devolverLivro(item)}
                      className="mt-5 bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 font-semibold"
                    >
                      ✔ Devolver Livro
                    </button>

                  )}

                </div>

              </div>

            );
          })}

        </div>
      )}

    </main>
  );
}