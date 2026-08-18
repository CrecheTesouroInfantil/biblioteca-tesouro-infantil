"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import HomeDashboard from "@/components/HomeDashboard";

export default function Home() {
  const [totalLivros, setTotalLivros] = useState(0);
  const [emprestados, setEmprestados] = useState(0);
  const [devolvidos, setDevolvidos] = useState(0);
  const [reservas, setReservas] = useState(0);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    const { count: livros } = await supabase
      .from("livros")
      .select("*", { count: "exact", head: true });

    const { count: emp } = await supabase
      .from("emprestimos")
      .select("*", { count: "exact", head: true })
      .eq("devolvido", false);

    const { count: dev } = await supabase
      .from("emprestimos")
      .select("*", { count: "exact", head: true })
      .eq("devolvido", true);

    const { count: res } = await supabase
      .from("reservas")
      .select("*", { count: "exact", head: true })
      .eq("atendida", false);

    setTotalLivros(livros ?? 0);
    setEmprestados(emp ?? 0);
    setDevolvidos(dev ?? 0);
    setReservas(res ?? 0);
  }

  return (
    <main className="p-8">

      <div className="mb-10">

        <h1 className="text-4xl font-bold text-blue-700">
          🏠 Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Bem-vindo à Biblioteca Tesouro Infantil
        </p>

      </div>

      <HomeDashboard
        totalLivros={totalLivros}
        emprestados={emprestados}
        devolvidos={devolvidos}
        reservas={reservas}
      />

      <div className="mt-10 bg-white rounded-3xl shadow-lg p-8">

        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          🚧 Em desenvolvimento
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-gray-700">

          <div>📚 Livros mais emprestados</div>
          <div>📤 Últimos empréstimos</div>
          <div>📌 Reservas pendentes</div>
          <div>📈 Estatísticas do acervo</div>

        </div>

      </div>

    </main>
  );
}