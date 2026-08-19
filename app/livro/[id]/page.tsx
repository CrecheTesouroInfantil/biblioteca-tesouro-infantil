"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";

import ReservaModal from "@/components/ReservaModal";
import EmprestimoModal from "@/components/EmprestimoModal";

interface Emprestimo {
  id: number;
  sala: string;
  data_emprestimo: string;
  data_prevista: string;
  data_devolucao: string | null;
  devolvido: boolean;
}

export default function Livro() {
  const params = useParams();

  const [livro, setLivro] = useState<any>(null);
  const [historico, setHistorico] = useState<Emprestimo[]>([]);

  const [abrirReserva, setAbrirReserva] = useState(false);
  const [abrirEmprestimo, setAbrirEmprestimo] = useState(false);

  useEffect(() => {
    buscarLivro();
    buscarHistorico();
  }, []);

  async function buscarLivro() {
    const { data, error } = await supabase
      .from("livros")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setLivro(data);
  }

  async function buscarHistorico() {
    const { data, error } = await supabase
      .from("emprestimos")
      .select("*")
      .eq("livro_id", params.id)
      .order("data_emprestimo", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setHistorico(data || []);
  }

  if (!livro) {
    return (
      <main className="p-10 text-center">
        Carregando...
      </main>
    );
  }

  const disponivel = (livro.quantidade ?? 0) > 0;

  const enderecoLivro =
    `https://biblioteca-tesouro-infantil-es3o-lyart.vercel.app/livro/${livro.id}`;

  function imprimirEtiqueta() {
    window.print();
  }

  return (
    <>
      <ReservaModal
        aberto={abrirReserva}
        fechar={() => setAbrirReserva(false)}
        livroId={livro.id}
      />

      <EmprestimoModal
        aberto={abrirEmprestimo}
        fechar={() => setAbrirEmprestimo(false)}
        livroId={livro.id}
      />

      <main className="min-h-screen bg-blue-50 p-4 md:p-8">

        <div className="max-w-7xl mx-auto">

          {/* FICHA DO LIVRO */}

          <div className="bg-white rounded-3xl shadow-xl p-5 md:p-10 print:hidden">

            <div className="grid lg:grid-cols-2 gap-8 md:gap-12">

              <div>

                {livro.capa ? (
                  <Image
                    src={livro.capa}
                    alt={livro.nome}
                    width={500}
                    height={700}
                    className="rounded-2xl shadow-lg w-full h-auto"
                  />
                ) : (
                  <div className="h-[400px] md:h-[600px] bg-gray-200 rounded-2xl flex items-center justify-center text-8xl">
                    📚
                  </div>
                )}

              </div>

              <div>

                <h1 className="text-3xl md:text-5xl font-bold text-blue-700">
                  {livro.nome}
                </h1>

                <div className="space-y-3 mt-6 md:mt-8 text-base md:text-lg">

                  <p>
                    <strong>👤 Autor:</strong> {livro.autor}
                  </p>

                  <p>
                    <strong>🏷️ Categoria:</strong> {livro.categoria}
                  </p>

                  <p>
                    <strong>👶 Faixa Etária:</strong> {livro.faixa_etaria}
                  </p>

                  <p>
                    <strong>📍 Local:</strong> {livro.local}
                  </p>

                  <p>
                    <strong>📦 Quantidade:</strong>{" "}
                    <span
                      className={
                        disponivel
                          ? "text-green-600 font-bold"
                          : "text-red-600 font-bold"
                      }
                    >
                      {livro.quantidade}
                    </span>
                  </p>

                  <p>
                    <strong>📖 Total de empréstimos:</strong>{" "}
                    {historico.length}
                  </p>

                  {!disponivel && (
                    <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-4 mt-4 font-bold">
                      🚫 Este livro está indisponível para empréstimo.
                    </div>
                  )}

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 md:mt-10">

                  {disponivel ? (
                    <button
                      onClick={() => setAbrirEmprestimo(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
                    >
                      📤 Emprestar
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-400 text-white py-3 rounded-xl font-bold cursor-not-allowed"
                    >
                      🚫 Indisponível
                    </button>
                  )}

                  <button
                    onClick={() => setAbrirReserva(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold"
                  >
                    📌 Reservar
                  </button>

                  <Link
                    href={`/editar/${livro.id}`}
                    className="bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl text-center font-bold"
                  >
                    ✏️ Editar
                  </Link>

                  <button
                    onClick={imprimirEtiqueta}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-center font-bold"
                  >
                    🖨️ Imprimir etiqueta
                  </button>

                  <Link
                    href="/biblioteca"
                    className="bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl text-center font-bold"
                  >
                    ← Voltar
                  </Link>

                </div>

              </div>

            </div>

          </div>

          {/* QR CODE NORMAL */}

          <div className="bg-white rounded-3xl shadow-xl mt-8 md:mt-10 p-6 md:p-8 print:hidden">

            <div className="flex flex-col items-center text-center">

              <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2">
                📱 QR Code do Livro
              </h2>

              <p className="text-gray-500 mb-6">
                Aponte a câmera do celular para acessar este livro.
              </p>

              <div className="bg-white p-4 rounded-2xl shadow-lg border">

                <QRCodeSVG
                  value={enderecoLivro}
                  size={220}
                  level="H"
                  includeMargin={true}
                />

              </div>

              <p className="mt-5 text-lg font-bold text-gray-700">
                {livro.nome}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Código: LIV-{String(livro.id).padStart(6, "0")}
              </p>

            </div>

          </div>

          {/* ETIQUETA PARA IMPRESSÃO */}

          <div className="hidden print:flex print:items-center print:justify-center">

            <div
              className="border-4 border-blue-700 rounded-2xl bg-white flex flex-col items-center justify-center text-center"
              style={{
                width: "8cm",
                height: "10cm",
                padding: "0.5cm",
              }}
            >

              <div className="text-blue-700 font-extrabold text-lg">
                📚 BIBLIOTECA
              </div>

              <div className="text-blue-700 font-extrabold text-lg">
                TESOURO INFANTIL
              </div>

              <div className="w-full border-t-2 border-blue-700 my-3" />

              <div className="font-bold text-xl text-gray-800 leading-tight">
                {livro.nome}
              </div>

              <div className="text-sm text-gray-600 mt-2">
                {livro.autor}
              </div>

              <div className="bg-white p-2 mt-3">
                <QRCodeSVG
                  value={enderecoLivro}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="font-bold text-gray-700 text-sm mt-2">
                LIV-{String(livro.id).padStart(6, "0")}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Aponte a câmera para consultar este livro
              </div>

            </div>

          </div>

          {/* HISTÓRICO */}

          <div className="bg-white rounded-3xl shadow-xl mt-8 md:mt-10 p-6 md:p-8 print:hidden">

            <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6">
              📜 Histórico de Empréstimos
            </h2>

            {historico.length === 0 ? (
              <p className="text-gray-500">
                Este livro ainda não possui empréstimos.
              </p>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead>

                    <tr className="border-b">

                      <th className="text-left py-3">
                        Turma
                      </th>

                      <th className="text-left">
                        Empréstimo
                      </th>

                      <th className="text-left">
                        Prevista
                      </th>

                      <th className="text-left">
                        Devolução
                      </th>

                      <th className="text-left">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {historico.map((item) => {

                      const atrasado =
                        !item.devolvido &&
                        new Date(item.data_prevista) < new Date();

                      return (
                        <tr
                          key={item.id}
                          className="border-b"
                        >

                          <td className="py-4">
                            {item.sala}
                          </td>

                          <td>
                            {item.data_emprestimo}
                          </td>

                          <td>
                            {item.data_prevista}
                          </td>

                          <td>
                            {item.data_devolucao || "-"}
                          </td>

                          <td>

                            {item.devolvido ? (
                              <span className="text-green-600 font-bold">
                                ✅ Devolvido
                              </span>
                            ) : atrasado ? (
                              <span className="text-red-600 font-bold">
                                ⏰ Atrasado
                              </span>
                            ) : (
                              <span className="text-blue-600 font-bold">
                                📤 Emprestado
                              </span>
                            )}

                          </td>

                        </tr>
                      );

                    })}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>

      </main>
    </>
  );
}