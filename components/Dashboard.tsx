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

  const [totalExemplares, setTotalExemplares] = useState(0);
  const [exemplaresDisponiveis, setExemplaresDisponiveis] =
    useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    /*
     * Busca todos os livros para calcular
     * o estoque real de exemplares.
     */
    const { data: livros, error: erroLivros } = await supabase
      .from("livros")
      .select("quantidade");

    if (!erroLivros && livros) {
      const total = livros.reduce(
        (soma, livro) => soma + (livro.quantidade ?? 0),
        0
      );

      setTotalExemplares(total);
    }

    /*
     * Empréstimos ativos
     */
    const { count: totalEmprestados } = await supabase
      .from("emprestimos")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("devolvido", false);

    setEmprestados(totalEmprestados || 0);

    /*
     * Reservas pendentes
     */
    const { count: totalReservas } = await supabase
      .from("reservas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("atendida", false);

    setReservas(totalReservas || 0);

    /*
     * Turmas cadastradas
     */
    const { count: totalTurmas } = await supabase
      .from("turmas")
      .select("*", {
        count: "exact",
        head: true,
      });

    setTurmas(totalTurmas || 0);

    /*
     * Empréstimos atrasados
     */
    const hoje = new Date()
      .toISOString()
      .split("T")[0];

    const { data: emprestimosAtrasados } = await supabase
      .from("emprestimos")
      .select("id")
      .eq("devolvido", false)
      .lt("data_prevista", hoje);

    setAtrasados(
      emprestimosAtrasados?.length || 0
    );
  }

  /*
   * O estoque disponível é calculado a partir
   * do total real de exemplares menos os
   * empréstimos ativos.
   */
  useEffect(() => {
    const disponiveis = Math.max(
      totalExemplares - emprestados,
      0
    );

    setExemplaresDisponiveis(disponiveis);
  }, [totalExemplares, emprestados]);

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
            titulo="Exemplares"
            valor={totalExemplares}
            emoji="📦"
          />

          <DashboardCard
            titulo="Disponíveis"
            valor={exemplaresDisponiveis}
            emoji="✅"
          />

          <DashboardCard
            titulo="Emprestados"
            valor={emprestados}
            emoji="📤"
          />

        </div>

        {/* SEGUNDA LINHA */}

        <div className="grid w-full min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 mb-8">

          <DashboardCard
            titulo="Reservas"
            valor={reservas}
            emoji="📌"
          />

          <DashboardCard
            titulo="Categorias"
            valor={totalCategorias}
            emoji="🏷️"
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
                📦 Total de exemplares:
                <strong> {totalExemplares}</strong>
              </p>

              <p>
                ✅ Exemplares disponíveis:
                <strong> {exemplaresDisponiveis}</strong>
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
                ⏰ Empréstimos atrasados:{" "}
                {atrasados}
              </p>

            </div>

          </div>

          <div className="w-full min-w-0 bg-white rounded-3xl shadow-lg p-5 md:p-6">

            <h2 className="text-xl md:text-2xl font-bold text-blue-700 mb-4">
              🚀 Recursos disponíveis
            </h2>

            <div className="space-y-3 text-base md:text-lg">

              <p>✅ QR Code dos livros</p>

              <p>✅ Leitura pela câmera</p>

              <p>✅ Histórico completo</p>

              <p>✅ Empréstimos e devoluções</p>

              <p>✅ Reservas integradas</p>

              <p>✅ Impressão de etiquetas</p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}