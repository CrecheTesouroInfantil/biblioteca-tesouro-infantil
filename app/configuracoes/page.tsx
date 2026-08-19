"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ConfiguracoesPage() {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [caixas, setCaixas] = useState<string[]>([]);
  const [faixas, setFaixas] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  async function carregarConfiguracoes() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("livros")
      .select("categoria,local,faixa_etaria");

    if (error) {
      console.log(error);
      setCarregando(false);
      return;
    }

    const dados = data || [];

    const categoriasUnicas = Array.from(
      new Set(
        dados
          .map((item) => item.categoria)
          .filter(Boolean)
      )
    ).sort();

    const caixasUnicas = Array.from(
      new Set(
        dados
          .map((item) => item.local)
          .filter(Boolean)
      )
    ).sort();

    const faixasUnicas = Array.from(
      new Set(
        dados
          .map((item) => item.faixa_etaria)
          .filter(Boolean)
      )
    ).sort();

    setCategorias(categoriasUnicas as string[]);
    setCaixas(caixasUnicas as string[]);
    setFaixas(faixasUnicas as string[]);

    setCarregando(false);
  }

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
            ⚙️ Configurações
          </h1>

          <p className="text-gray-500 mt-2">
            Informações utilizadas atualmente no acervo
          </p>

        </div>

        {carregando ? (

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">
            Carregando configurações...
          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <section className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-xl font-bold text-blue-700 mb-5">
                🏷️ Categorias
              </h2>

              {categorias.length === 0 ? (

                <p className="text-gray-500">
                  Nenhuma categoria cadastrada.
                </p>

              ) : (

                <div className="flex flex-wrap gap-2">

                  {categorias.map((categoria) => (

                    <span
                      key={categoria}
                      className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm font-semibold"
                    >
                      {categoria}
                    </span>

                  ))}

                </div>

              )}

            </section>

            <section className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-xl font-bold text-green-700 mb-5">
                📦 Caixas / Locais
              </h2>

              {caixas.length === 0 ? (

                <p className="text-gray-500">
                  Nenhum local cadastrado.
                </p>

              ) : (

                <div className="flex flex-wrap gap-2">

                  {caixas.map((caixa) => (

                    <span
                      key={caixa}
                      className="bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-semibold"
                    >
                      {caixa}
                    </span>

                  ))}

                </div>

              )}

            </section>

            <section className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-xl font-bold text-purple-700 mb-5">
                👶 Faixas etárias
              </h2>

              {faixas.length === 0 ? (

                <p className="text-gray-500">
                  Nenhuma faixa etária cadastrada.
                </p>

              ) : (

                <div className="flex flex-wrap gap-2">

                  {faixas.map((faixa) => (

                    <span
                      key={faixa}
                      className="bg-purple-100 text-purple-700 px-3 py-2 rounded-full text-sm font-semibold"
                    >
                      {faixa}
                    </span>

                  ))}

                </div>

              )}

            </section>

          </div>

        )}

        <section className="bg-white rounded-3xl shadow-lg p-6 mt-6">

          <h2 className="text-xl font-bold text-blue-700 mb-4">
            ℹ️ Sobre o sistema
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">

            <p>
              📚 <strong>Sistema:</strong> Biblioteca Tesouro Infantil
            </p>

            <p>
              🔢 <strong>Versão:</strong> 3.0
            </p>

            <p>
              📌 <strong>Reservas:</strong> integradas aos empréstimos
            </p>

            <p>
              🔲 <strong>QR Code:</strong> disponível nos livros
            </p>

            <p>
              📊 <strong>Relatórios:</strong> disponíveis
            </p>

            <p>
              📱 <strong>Compatibilidade:</strong> computador e celular
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}