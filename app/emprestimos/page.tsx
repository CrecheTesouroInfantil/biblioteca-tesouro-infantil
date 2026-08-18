"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  };
}

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarEmprestimos();
  }, []);

  async function buscarEmprestimos() {
    setCarregando(true);

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
      setCarregando(false);
      return;
    }

    setEmprestimos((data as Emprestimo[]) || []);
    setCarregando(false);
  }

  async function devolverLivro(item: Emprestimo) {
    const confirmar = confirm(
      `Deseja marcar "${item.livros?.nome}" como devolvido?`
    );

    if (!confirmar) return;

    // Marca o empréstimo como devolvido
    const { error } = await supabase
      .from("emprestimos")
      .update({
        devolvido: true,
        data_devolucao: new Date().toISOString().split("T")[0],
      })
      .eq("id", item.id);

    if (error) {
      alert("Erro ao devolver livro.");
      console.log(error);
      return;
    }

    // Atualiza estoque
    const { data: livro, error: erroLivro } = await supabase
      .from("livros")
      .select("quantidade")
      .eq("id", item.livro_id)
      .single();

    if (!erroLivro && livro) {
      await supabase
        .from("livros")
        .update({
          quantidade: (livro.quantidade ?? 0) + 1,
        })
        .eq("id", item.livro_id);
    }

    // Procura reserva pendente
    const { data: reserva } = await supabase
      .from("reservas")
      .select("*")
      .eq("livro_id", item.livro_id)
      .eq("atendida", false)
      .order("data_reserva", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (reserva) {
      alert(
        `📌 Existe uma reserva aguardando este livro.\n\nTurma: ${reserva.sala}`
      );
    } else {
      alert("Livro devolvido com sucesso!");
    }

    buscarEmprestimos();
  }

  return (
    <main className="p-8">

      <h1 className="text-4xl font-bold text-blue-700 mb-8">
        📤 Empréstimos
      </h1>

      {carregando ? (

        <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
          Carregando...
        </div>

      ) : emprestimos.length === 0 ? (

        <div className="bg-white rounded-3xl shadow-lg p-10 text-center text-gray-500">
          Nenhum empréstimo encontrado.
        </div>

      ) : (

        <div className="space-y-6">

          {emprestimos.map((item) => (

            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-lg p-6"
            >

              <h2 className="text-2xl font-bold text-blue-700">
                📚 {item.livros?.nome}
              </h2>

              <p className="mt-3">
                <strong>Turma:</strong> {item.sala}
              </p>

              <p>
                <strong>Empréstimo:</strong> {item.data_emprestimo}
              </p>

              <p>
                <strong>Previsão:</strong> {item.data_prevista}
              </p>

              <p>
                <strong>Devolução:</strong> {item.data_devolucao || "-"}
              </p>

              <p className="mt-3">

                {item.devolvido ? (

                  <span className="text-green-600 font-bold">
                    ✅ Devolvido
                  </span>

                ) : (

                  <span className="text-orange-600 font-bold">
                    📤 Emprestado
                  </span>

                )}

              </p>

              {!item.devolvido && (

                <button
                  onClick={() => devolverLivro(item)}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
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