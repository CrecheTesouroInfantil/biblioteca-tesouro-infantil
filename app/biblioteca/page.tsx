"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";

import Header from "@/components/Header";
import Biblioteca from "@/components/Biblioteca";

export default function BibliotecaPage() {
  const [livros, setLivros] = useState<any[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    buscarLivros();

    const channel = supabase
      .channel("livros")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "livros",
        },
        () => buscarLivros()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function buscarLivros() {
    const { data, error } = await supabase
      .from("livros")
      .select("*")
      .order("nome");

    if (error) {
      console.log(error);
      return;
    }

    setLivros(data || []);
  }

  const livrosFiltrados = livros.filter((livro) => {
    const texto = pesquisa.toLowerCase();

    return (
      livro.nome?.toLowerCase().includes(texto) ||
      livro.autor?.toLowerCase().includes(texto) ||
      livro.categoria?.toLowerCase().includes(texto) ||
      livro.local?.toLowerCase().includes(texto)
    );
  });

  function imprimirTodasEtiquetas() {
    window.print();
  }

  return (
    <main className="p-4 md:p-8">

      {/* ÁREA NORMAL DA BIBLIOTECA */}

      <div className="print:hidden">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-extrabold text-blue-700">
              📚 Biblioteca
            </h1>

            <p className="text-gray-500 mt-1">
              {livros.length} livro(s) cadastrado(s)
            </p>
          </div>

          <button
            onClick={imprimirTodasEtiquetas}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition"
          >
            🖨️ Imprimir todas as etiquetas
          </button>

        </div>

        <Header
          pesquisa={pesquisa}
          setPesquisa={setPesquisa}
        />

        <Biblioteca
          livros={livrosFiltrados}
        />

      </div>

      {/* ÁREA EXCLUSIVA PARA IMPRESSÃO */}

      <div className="hidden print:block">

        <div className="grid grid-cols-4 gap-2">

          {livros.map((livro) => {

            const enderecoLivro =
              `https://biblioteca-tesouro-infantil-es3o-lyart.vercel.app/livro/${livro.id}`;

            return (
              <div
                key={livro.id}
                className="border-2 border-blue-700 rounded-xl bg-white flex flex-col items-center justify-center text-center p-2 break-inside-avoid"
                style={{
                  height: "8cm",
                }}
              >

                <div className="text-blue-700 font-extrabold text-[11px] leading-tight">
                  📚 BIBLIOTECA
                </div>

                <div className="text-blue-700 font-extrabold text-[11px] leading-tight">
                  TESOURO INFANTIL
                </div>

                <div className="w-full border-t border-blue-700 my-1" />

                <div className="font-bold text-sm text-gray-800 leading-tight line-clamp-2">
                  {livro.nome}
                </div>

                <div className="text-[10px] text-gray-600 mt-1 line-clamp-1">
                  {livro.autor}
                </div>

                <div className="bg-white p-1 mt-1">
                  <QRCodeSVG
                    value={enderecoLivro}
                    size={105}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="font-bold text-gray-700 text-[10px] mt-1">
                  LIV-{String(livro.id).padStart(6, "0")}
                </div>

                <div className="text-[8px] text-gray-500 mt-1 leading-tight">
                  Escaneie para consultar este livro
                </div>

              </div>
            );

          })}

        </div>

      </div>

    </main>
  );
}