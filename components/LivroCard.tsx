"use client";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Livro } from "@/app/types/Livro";

interface LivroProps {
  livro: Livro;
  publico?: boolean;
  onEmprestar: (id: number) => void;
  onReservar: (id: number) => void;
}

export default function LivroCard({
  livro,
  publico = false,
  onEmprestar,
  onReservar,
}: LivroProps) {
  async function excluirLivro() {
    const confirmar = confirm(
      `Deseja excluir "${livro.nome}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("livros")
      .delete()
      .eq("id", livro.id);

    if (error) {
      alert("Erro ao excluir.");
      console.log(error);
      return;
    }

    window.location.reload();
  }

  const disponivel = (livro.quantidade ?? 0) > 0;

  return (
    <article
      className="
        group
        bg-white
        rounded-[1.75rem]
        overflow-hidden
        border border-gray-100
        shadow-sm
        hover:shadow-2xl
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >

      {/* CAPA */}

      <Link
        href={`/livro/${livro.id}`}
        className="block relative"
      >

        <div className="relative h-[300px] sm:h-[330px] bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex items-center justify-center">

          {livro.capa ? (

            <Image
              src={livro.capa}
              alt={livro.nome}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="
                object-contain
                p-3
                group-hover:scale-105
                transition-transform
                duration-500
              "
            />

          ) : (

            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-4xl">
                📚
              </div>

              <p className="text-sm text-gray-400 font-semibold mt-3">
                Sem capa
              </p>

            </div>

          )}

          {/* STATUS */}

          <div className="absolute top-4 left-4">

            {disponivel ? (

              <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-emerald-700 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Disponível
              </span>

            ) : (

              <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-red-700 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Indisponível
              </span>

            )}

          </div>

          {/* CÓDIGO */}

          {livro.codigo && (

            <div className="absolute bottom-4 right-4">

              <span className="bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide">
                {livro.codigo}
              </span>

            </div>

          )}

        </div>

      </Link>

      {/* INFORMAÇÕES */}

      <div className="p-5">

        <Link
          href={`/livro/${livro.id}`}
          className="block"
        >

          <h2
            className="
              text-lg
              sm:text-xl
              font-extrabold
              text-gray-800
              leading-tight
              line-clamp-2
              group-hover:text-blue-700
              transition-colors
            "
          >
            {livro.nome}
          </h2>

        </Link>

        <p className="text-sm text-gray-500 mt-2 line-clamp-1">
          {livro.autor || "Autor não informado"}
        </p>

        {/* TAGS */}

        <div className="flex flex-wrap gap-2 mt-4">

          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full text-xs font-bold">
            {livro.categoria || "Sem categoria"}
          </span>

          {livro.local && (

            <span className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1.5 rounded-full text-xs font-bold">
              📦 {livro.local}
            </span>

          )}

        </div>

        {/* TEMA */}

        {livro.tema && (

          <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-4">

            <p className="text-[10px] uppercase tracking-wide font-bold text-purple-500">
              💭 Tema
            </p>

            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
              {livro.tema}
            </p>

          </div>

        )}

        {/* DETALHES */}

        <div className="grid grid-cols-2 gap-3 mt-5">

          <div className="bg-gray-50 rounded-xl p-3">

            <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
              Faixa etária
            </p>

            <p className="text-sm font-bold text-gray-700 mt-1 line-clamp-1">
              {livro.faixa_etaria || "Todas"}
            </p>

          </div>

          <div className="bg-gray-50 rounded-xl p-3">

            <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
              Exemplares
            </p>

            <p className="text-sm font-bold text-gray-700 mt-1">
              {livro.quantidade ?? 0}
            </p>

          </div>

        </div>

        {/* ÁREA PÚBLICA */}

        {publico ? (

          <div className="mt-5">

            {disponivel ? (

              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl py-3 text-center font-bold text-sm">
                ✓ Disponível para empréstimo
              </div>

            ) : (

              <div className="space-y-3">

                <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl py-3 text-center font-bold text-sm">
                  Livro indisponível
                </div>

                <button
                  type="button"
                  onClick={() => onReservar(livro.id)}
                  className="
                    w-full
                    bg-purple-600
                    hover:bg-purple-700
                    text-white
                    rounded-xl
                    py-3
                    font-bold
                    text-sm
                    transition
                  "
                >
                  Reservar livro
                </button>

              </div>

            )}

          </div>

        ) : (

          /* ÁREA ADMINISTRATIVA */

          <div className="mt-5 space-y-3">

            {disponivel ? (

              <button
                type="button"
                onClick={() => onEmprestar(livro.id)}
                className="
                  w-full
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  rounded-xl
                  py-3
                  font-bold
                  text-sm
                  shadow-sm
                  hover:shadow-md
                  transition
                "
              >
                Emprestar livro
              </button>

            ) : (

              <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl py-3 text-center font-bold text-sm">
                Nenhum exemplar disponível
              </div>

            )}

            {!disponivel && (

              <button
                type="button"
                onClick={() => onReservar(livro.id)}
                className="
                  w-full
                  bg-purple-600
                  hover:bg-purple-700
                  text-white
                  rounded-xl
                  py-3
                  font-bold
                  text-sm
                  transition
                "
              >
                Reservar livro
              </button>

            )}

            <div className="grid grid-cols-2 gap-3">

              <Link
                href={`/editar/${livro.id}`}
                className="
                  bg-gray-100
                  hover:bg-amber-100
                  text-gray-700
                  hover:text-amber-700
                  border border-gray-200
                  hover:border-amber-200
                  rounded-xl
                  py-2.5
                  text-center
                  font-bold
                  text-sm
                  transition
                "
              >
                Editar
              </Link>

              <button
                type="button"
                onClick={excluirLivro}
                className="
                  bg-gray-100
                  hover:bg-red-100
                  text-gray-700
                  hover:text-red-700
                  border border-gray-200
                  hover:border-red-200
                  rounded-xl
                  py-2.5
                  text-center
                  font-bold
                  text-sm
                  transition
                "
              >
                Excluir
              </button>

            </div>

          </div>

        )}

      </div>

    </article>
  );
}