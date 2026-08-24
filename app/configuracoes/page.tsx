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
    <main className="min-h-screen bg-[#eef5ff] p-4 md:p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* CABEÇALHO */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            bg-gradient-to-br
            from-[#1748d1]
            via-[#2457dc]
            to-[#12358f]
            text-white
            shadow-xl
          "
        >

          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/10" />

          <div className="absolute -left-20 -bottom-32 w-64 h-64 rounded-full bg-white/5" />

          <div className="relative p-6 md:p-8">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-3xl">
                ⚙️
              </div>

              <div>

                <p className="text-xs uppercase tracking-[0.18em] font-bold text-blue-100">
                  Sistema
                </p>

                <h1 className="text-3xl md:text-4xl font-extrabold">
                  Configurações
                </h1>

                <p className="text-blue-100 mt-1">
                  Informações e opções utilizadas atualmente no acervo.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* STATUS */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                🏷️
              </div>

              <span className="text-xs font-bold text-gray-400">
                ACERVO
              </span>

            </div>

            <p className="text-gray-500 text-sm mt-4">
              Categorias utilizadas
            </p>

            <p className="text-3xl font-extrabold text-blue-700 mt-1">
              {categorias.length}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-xl">
                📦
              </div>

              <span className="text-xs font-bold text-gray-400">
                LOCALIZAÇÃO
              </span>

            </div>

            <p className="text-gray-500 text-sm mt-4">
              Locais encontrados
            </p>

            <p className="text-3xl font-extrabold text-green-600 mt-1">
              {caixas.length}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center text-xl">
                👶
              </div>

              <span className="text-xs font-bold text-gray-400">
                PÚBLICO
              </span>

            </div>

            <p className="text-gray-500 text-sm mt-4">
              Faixas utilizadas
            </p>

            <p className="text-3xl font-extrabold text-purple-600 mt-1">
              {faixas.length}
            </p>

          </div>

        </section>

        {/* CONFIGURAÇÕES */}

        {carregando ? (

          <div className="bg-white rounded-[2rem] shadow-sm p-12 text-center">

            <div className="text-5xl mb-4">
              ⚙️
            </div>

            <p className="text-gray-500 font-semibold">
              Carregando configurações...
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CATEGORIAS */}

            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

              <div className="h-1.5 bg-blue-600" />

              <div className="p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
                    🏷️
                  </div>

                  <div>

                    <h2 className="text-xl font-extrabold text-gray-800">
                      Categorias
                    </h2>

                    <p className="text-sm text-gray-500">
                      Classificação dos livros
                    </p>

                  </div>

                </div>

                {categorias.length === 0 ? (

                  <div className="bg-gray-50 rounded-2xl p-5 text-center text-gray-500">
                    Nenhuma categoria cadastrada.
                  </div>

                ) : (

                  <div className="flex flex-wrap gap-2">

                    {categorias.map((categoria) => (

                      <span
                        key={categoria}
                        className="
                          bg-blue-50
                          border border-blue-100
                          text-blue-700
                          px-3 py-2
                          rounded-xl
                          text-sm
                          font-bold
                        "
                      >
                        {categoria}
                      </span>

                    ))}

                  </div>

                )}

              </div>

            </section>

            {/* LOCAIS */}

            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

              <div className="h-1.5 bg-green-500" />

              <div className="p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
                    📦
                  </div>

                  <div>

                    <h2 className="text-xl font-extrabold text-gray-800">
                      Locais
                    </h2>

                    <p className="text-sm text-gray-500">
                      Onde os livros estão guardados
                    </p>

                  </div>

                </div>

                {caixas.length === 0 ? (

                  <div className="bg-gray-50 rounded-2xl p-5 text-center text-gray-500">
                    Nenhum local cadastrado.
                  </div>

                ) : (

                  <div className="space-y-2">

                    {caixas.map((caixa, index) => (

                      <div
                        key={caixa}
                        className="
                          flex
                          items-center
                          gap-3
                          bg-green-50
                          border border-green-100
                          rounded-xl
                          px-4 py-3
                        "
                      >

                        <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm font-extrabold text-green-700">
                          {index + 1}
                        </span>

                        <span className="font-bold text-green-700">
                          {caixa}
                        </span>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>

            {/* FAIXAS */}

            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

              <div className="h-1.5 bg-purple-500" />

              <div className="p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
                    👶
                  </div>

                  <div>

                    <h2 className="text-xl font-extrabold text-gray-800">
                      Faixas etárias
                    </h2>

                    <p className="text-sm text-gray-500">
                      Público indicado para os livros
                    </p>

                  </div>

                </div>

                {faixas.length === 0 ? (

                  <div className="bg-gray-50 rounded-2xl p-5 text-center text-gray-500">
                    Nenhuma faixa cadastrada.
                  </div>

                ) : (

                  <div className="space-y-2">

                    {faixas.map((faixa) => (

                      <div
                        key={faixa}
                        className="
                          bg-purple-50
                          border border-purple-100
                          text-purple-700
                          rounded-xl
                          px-4 py-3
                          font-bold
                        "
                      >
                        👶 {faixa}
                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>

          </div>

        )}

        {/* SOBRE */}

        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

          <div className="h-1.5 bg-blue-600" />

          <div className="p-6 md:p-7">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
                ℹ️
              </div>

              <div>

                <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">
                  Sobre o sistema
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Informações da Biblioteca Tesouro Infantil
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              <div className="bg-blue-50 rounded-2xl p-4">

                <p className="text-xs text-blue-500 font-bold uppercase">
                  Sistema
                </p>

                <p className="font-extrabold text-blue-800 mt-1">
                  📚 Biblioteca Tesouro Infantil
                </p>

              </div>

              <div className="bg-indigo-50 rounded-2xl p-4">

                <p className="text-xs text-indigo-500 font-bold uppercase">
                  Versão
                </p>

                <p className="font-extrabold text-indigo-800 mt-1">
                  🔢 3.0
                </p>

              </div>

              <div className="bg-purple-50 rounded-2xl p-4">

                <p className="text-xs text-purple-500 font-bold uppercase">
                  Reservas
                </p>

                <p className="font-extrabold text-purple-800 mt-1">
                  📌 Integradas
                </p>

              </div>

              <div className="bg-green-50 rounded-2xl p-4">

                <p className="text-xs text-green-500 font-bold uppercase">
                  QR Code
                </p>

                <p className="font-extrabold text-green-800 mt-1">
                  🔲 Disponível
                </p>

              </div>

              <div className="bg-orange-50 rounded-2xl p-4">

                <p className="text-xs text-orange-500 font-bold uppercase">
                  Relatórios
                </p>

                <p className="font-extrabold text-orange-800 mt-1">
                  📊 Disponíveis
                </p>

              </div>

              <div className="bg-pink-50 rounded-2xl p-4">

                <p className="text-xs text-pink-500 font-bold uppercase">
                  Compatibilidade
                </p>

                <p className="font-extrabold text-pink-800 mt-1">
                  📱 Computador e celular
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* AVISO */}

        <section className="bg-amber-50 border border-amber-100 rounded-[2rem] p-5 md:p-6">

          <div className="flex items-start gap-4">

            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
              💡
            </div>

            <div>

              <h3 className="font-extrabold text-amber-800">
                Configurações atuais
              </h3>

              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                Nesta versão, as categorias, locais e faixas
                etárias são identificados automaticamente a partir
                dos livros cadastrados no acervo. As opções exibidas
                aqui representam os valores que já estão sendo
                utilizados.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}