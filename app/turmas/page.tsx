"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Turma {
  id: number;
  nome: string;
}

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [nome, setNome] = useState("");

  useEffect(() => {
    buscarTurmas();
  }, []);

  async function buscarTurmas() {
    const { data, error } = await supabase
      .from("turmas")
      .select("*")
      .order("nome");

    if (error) {
      console.log(error);
      return;
    }

    setTurmas(data || []);
  }

  async function cadastrarTurma() {
    if (!nome.trim()) {
      alert("Digite o nome da turma.");
      return;
    }

    const { error } = await supabase
      .from("turmas")
      .insert({
        nome: nome.trim().toUpperCase(),
      });

    if (error) {
      alert(error.message);
      return;
    }

    setNome("");
    buscarTurmas();
  }

  async function excluirTurma(id: number) {
    if (!confirm("Deseja excluir esta turma?")) return;

    const { error } = await supabase
      .from("turmas")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    buscarTurmas();
  }

  return (
    <main className="p-8">

      <h1 className="text-4xl font-bold text-blue-700 mb-8">
        👶 Turmas
      </h1>

      <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">

        <div className="flex gap-4">

          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da turma"
            className="flex-1 border rounded-xl p-3"
          />

          <button
            onClick={cadastrarTurma}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold"
          >
            ➕ Adicionar
          </button>

        </div>

      </div>

      <div className="space-y-4">

        {turmas.map((turma) => (

          <div
            key={turma.id}
            className="bg-white rounded-2xl shadow-lg p-5 flex justify-between items-center"
          >

            <h2 className="text-xl font-bold">
              👶 {turma.nome}
            </h2>

            <button
              onClick={() => excluirTurma(turma.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl"
            >
              🗑️ Excluir
            </button>

          </div>

        ))}

      </div>

    </main>
  );
}