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
      .order("data_emprestimo", {
        ascending: false,
      });

    if (error) {
      console.log(error);
      return;
    }

    setHistorico(data || []);
  }

  if (!livro) {
    return (
      <main className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-6">

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">

          <div className="text-5xl mb-4">
            📚
          </div>

          <p className="text-gray-500 font-semibold">
            Carregando informações do livro...
          </p>

        </div>

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

      <main className="min-h-screen bg-[#eef5ff] p-4 md:p-8">

        <div className="max-w-7xl mx-auto space-y-6">

          {/* CABEÇALHO */}

          <section
            className="
              print:hidden
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

            <div className="relative p-6 md:p-8">

              <div className="flex items-center gap-3">

                <Link
                  href="/biblioteca"
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-white/10
                    hover:bg-white/20
                    border border-white/10
                    flex items-center justify-center
                    text-xl
                    transition
                  "
                >
                  ←
                </Link>

                <div>

                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-100">
                    Biblioteca Tesouro Infantil
                  </p>

                  <h1 className="text-xl md:text-2xl font-extrabold mt-1">
                    Detalhes do livro
                  </h1>

                </div>

              </div>

            </div>

          </section>

          {/* FICHA PRINCIPAL */}

          <section
            className="
              bg-white
              rounded-[2rem]
              border border-gray-100
              shadow-sm
              overflow-hidden
              print:hidden
            "
          >

            <div className="grid lg:grid-cols-[420px_1fr]">

              {/* CAPA */}

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-8 flex items-center justify-center">

                <div className="relative w-full max-w-[350px]">

                  <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl bg-white">

                    {livro.capa ? (

                      <Image
                        src={livro.capa}
                        alt={livro.nome}
                        fill
                        sizes="350px"
                        className="object-cover"
                      />

                    ) : (

                      <div className="absolute inset-0 flex flex-col items-center justify-center">

                        <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-5xl">
                          📚
                        </div>

                        <p className="text-gray-400 font-semibold mt-4">
                          Sem capa
                        </p>

                      </div>

                    )}

                  </div>

                  {/* STATUS */}

                  <div className="absolute top-4 left-4">

                    {disponivel ? (

                      <span className="bg-white/95 backdrop-blur-sm text-emerald-700 px-4 py-2 rounded-full text-xs font-extrabold shadow-lg">
                        ● Disponível
                      </span>

                    ) : (

                      <span className="bg-white/95 backdrop-blur-sm text-red-700 px-4 py-2 rounded-full text-xs font-extrabold shadow-lg">
                        ● Indisponível
                      </span>

                    )}

                  </div>

                </div>

              </div>

              {/* INFORMAÇÕES */}

              <div className="p-6 md:p-9 lg:p-10">

                <div className="flex flex-wrap gap-2 mb-5">

                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold">
                    {livro.categoria || "Sem categoria"}
                  </span>

                  <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-full text-xs font-bold">
                    👶 {livro.faixa_etaria || "Todas"}
                  </span>

                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
                  {livro.nome}
                </h2>

                <p className="text-gray-500 text-lg mt-2">
                  {livro.autor || "Autor não informado"}
                </p>

                {/* INFORMAÇÕES */}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-7">

                  <div className="bg-gray-50 rounded-2xl p-4">

                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                      Código
                    </p>

                    <p className="text-sm font-extrabold text-gray-700 mt-1">
                      {livro.codigo ||
                        `LIV-${String(livro.id).padStart(6, "0")}`}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">

                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                      Localização
                    </p>

                    <p className="text-sm font-extrabold text-gray-700 mt-1">
                      📦 {livro.local || "-"}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">

                    <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
                      Exemplares
                    </p>

                    <p
                      className={`text-sm font-extrabold mt-1 ${
                        disponivel
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {livro.quantidade ?? 0}
                    </p>

                  </div>

                </div>

                {/* ALERTA */}

                {!disponivel && (

                  <div className="mt-5 bg-red-50 border border-red-100 rounded-2xl p-4">

                    <p className="text-red-700 font-bold text-sm">
                      Este livro está indisponível no momento.
                    </p>

                    <p className="text-red-600 text-xs mt-1">
                      Você pode fazer uma reserva para ser avisado quando estiver disponível.
                    </p>

                  </div>

                )}

                {/* AÇÕES */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">

                  {disponivel ? (

                    <button
                      type="button"
                      onClick={() => setAbrirEmprestimo(true)}
                      className="
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        py-3.5
                        rounded-xl
                        font-extrabold
                        transition
                        shadow-sm
                      "
                    >
                      Emprestar livro
                    </button>

                  ) : (

                    <button
                      type="button"
                      disabled
                      className="
                        bg-gray-200
                        text-gray-400
                        py-3.5
                        rounded-xl
                        font-extrabold
                        cursor-not-allowed
                      "
                    >
                      Indisponível
                    </button>

                  )}

                  <button
                    type="button"
                    onClick={() => setAbrirReserva(true)}
                    className="
                      bg-purple-600
                      hover:bg-purple-700
                      text-white
                      py-3.5
                      rounded-xl
                      font-extrabold
                      transition
                    "
                  >
                    Reservar livro
                  </button>

                  <Link
                    href={`/editar/${livro.id}`}
                    className="
                      bg-gray-100
                      hover:bg-amber-100
                      text-gray-700
                      hover:text-amber-700
                      border border-gray-200
                      hover:border-amber-200
                      py-3.5
                      rounded-xl
                      text-center
                      font-extrabold
                      transition
                    "
                  >
                    Editar livro
                  </Link>

                  <button
                    type="button"
                    onClick={imprimirEtiqueta}
                    className="
                      bg-gray-100
                      hover:bg-emerald-100
                      text-gray-700
                      hover:text-emerald-700
                      border border-gray-200
                      hover:border-emerald-200
                      py-3.5
                      rounded-xl
                      font-extrabold
                      transition
                    "
                  >
                    Imprimir etiqueta
                  </button>

                </div>

                <Link
                  href="/biblioteca"
                  className="
                    block
                    text-center
                    text-sm
                    font-bold
                    text-gray-500
                    hover:text-blue-700
                    mt-5
                    transition
                  "
                >
                  ← Voltar para a biblioteca
                </Link>

              </div>

            </div>

          </section>

          {/* QR CODE */}

          <section
            className="
              bg-white
              rounded-[2rem]
              border border-gray-100
              shadow-sm
              p-6 md:p-8
              print:hidden
            "
          >

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">

              <div className="text-center lg:text-left">

                <span className="inline-flex bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  Acesso rápido
                </span>

                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-3">
                  QR Code do livro
                </h2>

                <p className="text-gray-500 mt-2 max-w-md">
                  Aponte a câmera do celular para acessar
                  diretamente a página deste livro.
                </p>

                <p className="text-sm font-bold text-gray-600 mt-4">
                  {livro.nome}
                </p>

              </div>

              <div className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100">

                <QRCodeSVG
                  value={enderecoLivro}
                  size={200}
                  level="H"
                  includeMargin={true}
                />

              </div>

            </div>

          </section>

          {/* HISTÓRICO */}

          <section
            className="
              bg-white
              rounded-[2rem]
              border border-gray-100
              shadow-sm
              overflow-hidden
              print:hidden
            "
          >

            <div className="p-6 md:p-8 border-b border-gray-100">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">
                    Histórico de empréstimos
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Registro das movimentações deste livro.
                  </p>

                </div>

                <div className="hidden sm:flex w-11 h-11 bg-blue-50 text-blue-700 rounded-2xl items-center justify-center text-xl">
                  📜
                </div>

              </div>

            </div>

            {historico.length === 0 ? (

              <div className="p-10 md:p-14 text-center">

                <div className="text-5xl mb-4">
                  📚
                </div>

                <p className="text-gray-500 font-semibold">
                  Este livro ainda não possui empréstimos.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto p-4 md:p-6">

                <table className="w-full min-w-[700px]">

                  <thead>

                    <tr className="bg-gray-50 rounded-xl">

                      <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 font-bold">
                        Turma
                      </th>

                      <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 font-bold">
                        Empréstimo
                      </th>

                      <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 font-bold">
                        Prevista
                      </th>

                      <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 font-bold">
                        Devolução
                      </th>

                      <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 font-bold">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {historico.map((item) => {

                      const atrasado =
                        !item.devolvido &&
                        new Date(item.data_prevista) <
                          new Date();

                      return (

                        <tr
                          key={item.id}
                          className="border-b last:border-b-0 hover:bg-gray-50 transition"
                        >

                          <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                            {item.sala}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {item.data_emprestimo}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {item.data_prevista}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {item.data_devolucao || "-"}
                          </td>

                          <td className="px-4 py-4">

                            {item.devolvido ? (

                              <span className="inline-flex bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold">
                                ✓ Devolvido
                              </span>

                            ) : atrasado ? (

                              <span className="inline-flex bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-full text-xs font-bold">
                                ⏰ Atrasado
                              </span>

                            ) : (

                              <span className="inline-flex bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold">
                                ↗ Emprestado
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

          </section>

          {/* ETIQUETA PARA IMPRESSÃO */}

          <div className="hidden print:flex print:items-center print:justify-center">

            <div
              className="
                border-4
                border-blue-700
                rounded-2xl
                bg-white
                flex
                flex-col
                items-center
                justify-center
                text-center
              "
              style={{
                width: "8cm",
                height: "10cm",
                padding: "0.5cm",
              }}
            >

              <div className="text-blue-700 font-extrabold text-lg">
                BIBLIOTECA
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

        </div>

      </main>
    </>
  );
}