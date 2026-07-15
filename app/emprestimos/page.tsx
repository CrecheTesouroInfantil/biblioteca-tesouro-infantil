"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Emprestimo {
  id: number;
  professora: string;
  data_emprestimo: string;
  data_devolucao: string | null;
  devolvido: boolean;
  livros: {
    nome: string;
    capa: string;
  };
}

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

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
          capa
        )
      `)
      .order("data_emprestimo", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setEmprestimos((data as Emprestimo[]) || []);
  }

  async function devolverLivro(id: number) {
    const { error } = await supabase
      .from("emprestimos")
      .update({
        devolvido: true,
        data_devolucao: new Date().toISOString().split("T")[0],
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao devolver livro.");
      return;
    }

    buscarEmprestimos();
  }

  return (
    <main className="p-8">

      <h1 className="text-4xl font-bold text-blue-700 mb-8">
        📤 Empréstimos
      </h1>

      {emprestimos.length === 0 ? (

        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
          Nenhum empréstimo encontrado.
        </div>

      ) : (

        <div className="space-y-6">

          {emprestimos.map((item) => (

            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg p-6"
            >

              <h2 className="text-2xl font-bold">
                📖 {item.livros?.nome}
              </h2>

              <p className="mt-2">
                👩 Professora: <strong>{item.professora}</strong>
              </p>

              <p>
                📅 Empréstimo: {item.data_emprestimo}
              </p>

              <p className="mt-2">

                {item.devolvido
                  ? "✅ Devolvido"
                  : "📤 Emprestado"}

              </p>

              {!item.devolvido && (

                <button
                  onClick={() => devolverLivro(item.id)}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3"
                >
                  ✔ Marcar como devolvido
                </button>

              )}

            </div>

          ))}

        </div>

      )}

    </main>
  );
}