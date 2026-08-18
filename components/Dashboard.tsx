"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardCard from "./DashboardCard";

interface DashboardProps {
  totalLivros: number;
  totalCategorias: number;
  totalCaixas: number;
  totalCapas: number;
}

export default function Dashboard({
  totalLivros,
  totalCategorias,
  totalCaixas,
  totalCapas,
}: DashboardProps) {
  const [emprestados, setEmprestados] = useState(0);
  const [reservas, setReservas] = useState(0);
  const [turmas, setTurmas] = useState(0);
  const [atrasados, setAtrasados] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const { count: totalEmprestados } = await supabase
      .from("emprestimos")
      .select("*", { count: "exact", head: true })
      .eq("devolvido", false);

    setEmprestados(totalEmprestados || 0);

    const { count: totalReservas } = await supabase
      .from("reservas")
      .select("*", { count: "exact", head: true })
      .eq("atendida", false);

    setReservas(totalReservas || 0);

    const { count: totalTurmas } = await supabase
      .from("turmas")
      .select("*", { count: "exact", head: true });

    setTurmas(totalTurmas || 0);

    const hoje = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("emprestimos")
      .select("id")
      .eq("devolvido", false)
      .lt("data_prevista", hoje);

    setAtrasados(data?.length || 0);
  }

  const disponiveis = Math.max(totalLivros - emprestados, 0);

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden">

      <div className="w-full min-w-0 px-1 md:px-2">

        {/* PRIMEIRA LINHA */}
        <div className="grid w-full min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 mb-6">

          <DashboardCard
            titulo="Livros"
            valor={totalLivros}
            emoji="📚"
          />

          <DashboardCard
            titulo="Disponíveis"
            valor={disponiveis}
            emoji="✅"
          />

          <DashboardCard
            titulo="Emprestados"
            valor={emprestados}
            emoji="📤"
          />

          <DashboardCard
            titulo="Reservas"
            valor={reservas}
            emoji="📌"
          />

        </div>

        {/* SEGUNDA LINHA */}
        <div className="grid w-full min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 mb-8">

          <DashboardCard
            titulo="Categorias"
            valor={totalCategorias}
            emoji="🏷️"
          />

          <DashboardCard
            titulo="Caixas"
            valor={totalCaixas}
            emoji="📦"
          />

          <DashboardCard
            titulo="Capas"
            valor={totalCapas}
            emoji="🖼️"
          />

          <DashboardCard
            titulo="Turmas"
            valor={turmas}
            emoji="👶"
          />

        </div>

        {/* INFORMAÇÕES */}
        <div className="grid w-full min-w-0 grid-cols-1 xl:grid-cols-2 gap-5">

          <div className="w-full min-w-0 bg-white rounded-3xl shadow-lg p-5 md:p-6">

            <h2 className="text-xl md:text-2xl font-bold text-blue-700 mb-4">
              📊 Situação da Biblioteca
            </h2>

            <div className="space-y-3 text-base md:text-lg">

              <p>
                📚 Livros cadastrados:
                <strong> {totalLivros}</strong>
              </p>

              <p>
                📤 Livros emprestados:
                <strong> {emprestados}</strong>
              </p>

              <p>
                📌 Reservas pendentes:
                <strong> {reservas}</strong>
              </p>

              <p>
                👶 Turmas cadastradas:
                <strong> {turmas}</strong>
              </p>

              <p
                className={
                  atrasados > 0
                    ? "text-red-600 font-bold"
                    : "text-green-600 font-bold"
                }
              >
                ⏰ Empréstimos atrasados: {atrasados}
              </p>

            </div>

          </div>

          <div className="w-full min-w-0 bg-white rounded-3xl shadow-lg p-5 md:p-6">

            <h2 className="text-xl md:text-2xl font-bold text-blue-700 mb-4">
              🚀 Próximos Recursos
            </h2>

            <div className="space-y-3 text-base md:text-lg">

              <p>✅ QR Code dos livros</p>

              <p>✅ Leitura pela câmera</p>

              <p>✅ Histórico completo</p>

              <p>✅ Relatórios em PDF</p>

              <p>✅ Livros mais emprestados</p>

              <p>✅ Estatísticas por turma</p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}