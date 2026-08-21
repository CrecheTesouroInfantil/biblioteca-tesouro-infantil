"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import Header from "@/components/Header";
import Biblioteca from "@/components/Biblioteca";

export default function BibliotecaPage() {
  const [livros, setLivros] = useState<any[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  const [faixaSelecionada, setFaixaSelecionada] =
    useState("Todas");

  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState("Todas");

  const [localSelecionado, setLocalSelecionado] =
    useState("Todos");

  const [disponibilidade, setDisponibilidade] =
    useState("Todos");

  useEffect(() => {
    buscarLivros();

    const channel = supabase
      .channel("livros-publicos")
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

  const categorias = useMemo(() => {
    return Array.from(
      new Set(
        livros
          .map((livro) => livro.categoria)
          .filter(Boolean)
      )
    ).sort();
  }, [livros]);

  const faixas = useMemo(() => {
    return Array.from(
      new Set(
        livros
          .map((livro) => livro.faixa_etaria)
          .filter(Boolean)
      )
    ).sort();
  }, [livros]);

  const locais = useMemo(() => {
    return Array.from(
      new Set(
        livros
          .map((livro) => livro.local)
          .filter(Boolean)
      )
    ).sort();
  }, [livros]);

  const textoPesquisa = pesquisa
    .toLowerCase()
    .trim();

  const livrosFiltrados = useMemo(() => {
    return livros.filter((livro) => {
      const correspondePesquisa =
        !textoPesquisa ||
        livro.nome
          ?.toLowerCase()
          .includes(textoPesquisa) ||
        livro.autor
          ?.toLowerCase()
          .includes(textoPesquisa) ||
        livro.categoria
          ?.toLowerCase()
          .includes(textoPesquisa) ||
        livro.local
          ?.toLowerCase()
          .includes(textoPesquisa) ||
        livro.faixa_etaria
          ?.toLowerCase()
          .includes(textoPesquisa) ||
        livro.codigo
          ?.toLowerCase()
          .includes(textoPesquisa) ||
        String(livro.id).includes(textoPesquisa);

      const correspondeFaixa =
        faixaSelecionada === "Todas" ||
        livro.faixa_etaria === faixaSelecionada;

      const correspondeCategoria =
        categoriaSelecionada === "Todas" ||
        livro.categoria === categoriaSelecionada;

      const correspondeLocal =
        localSelecionado === "Todos" ||
        livro.local === localSelecionado;

      const quantidade =
        livro.quantidade ?? 0;

      const correspondeDisponibilidade =
        disponibilidade === "Todos" ||
        (disponibilidade === "Disponíveis" &&
          quantidade > 0) ||
        (disponibilidade === "Indisponíveis" &&
          quantidade <= 0);

      return (
        correspondePesquisa &&
        correspondeFaixa &&
        correspondeCategoria &&
        correspondeLocal &&
        correspondeDisponibilidade
      );
    });
  }, [
    livros,
    textoPesquisa,
    faixaSelecionada,
    categoriaSelecionada,
    localSelecionado,
    disponibilidade,
  ]);

  const filtrosAtivos =
    faixaSelecionada !== "Todas" ||
    categoriaSelecionada !== "Todas" ||
    localSelecionado !== "Todos" ||
    disponibilidade !== "Todos" ||
    textoPesquisa !== "";

  function limparFiltros() {
    setPesquisa("");
    setFaixaSelecionada("Todas");
    setCategoriaSelecionada("Todas");
    setLocalSelecionado("Todos");
    setDisponibilidade("Todos");
  }

  return (
    <main className="min-h-screen bg-[#eef5ff] p-4 md:p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* CABEÇALHO */}

        <section
          className="
            relative overflow-hidden
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

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">

                    <img
                      src="/logo-creche.png"
                      alt="Creche Tesouro Infantil"
                      className="w-9 h-9 object-contain"
                    />

                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-100">
                      Acervo escolar
                    </p>

                    <p className="font-bold">
                      Tesouro Infantil
                    </p>

                  </div>

                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Biblioteca
                </h1>

                <p className="text-blue-100 mt-2 max-w-2xl">
                  Encontre livros, consulte o acervo e veja
                  rapidamente quais exemplares estão disponíveis.
                </p>

              </div>

              <div className="hidden sm:flex">

                <div className="bg-white/10 border border-white/10 rounded-3xl px-7 py-5 text-center backdrop-blur-sm">

                  <p className="text-3xl font-extrabold">
                    {livros.length}
                  </p>

                  <p className="text-xs text-blue-100 mt-1">
                    livros cadastrados
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* BUSCA */}

        <Header
          pesquisa={pesquisa}
          setPesquisa={setPesquisa}
          publico={true}
        />

        {/* FILTROS */}

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

            <div>

              <h2 className="text-lg md:text-xl font-extrabold text-gray-800">
                Encontre o livro ideal
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Use os filtros para localizar rapidamente um livro.
              </p>

            </div>

            {filtrosAtivos && (
              <button
                type="button"
                onClick={limparFiltros}
                className="
                  text-sm
                  font-bold
                  text-blue-700
                  bg-blue-50
                  hover:bg-blue-100
                  px-4 py-2.5
                  rounded-xl
                  transition
                "
              >
                Limpar filtros
              </button>
            )}

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* FAIXA */}

            <div>

              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                👶 Faixa etária
              </label>

              <select
                value={faixaSelecionada}
                onChange={(e) =>
                  setFaixaSelecionada(e.target.value)
                }
                className="
                  w-full
                  bg-gray-50
                  border border-gray-200
                  rounded-xl
                  px-4 py-3
                  text-gray-700
                  font-semibold
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              >

                <option value="Todas">
                  Todas
                </option>

                {faixas.map((faixa) => (
                  <option
                    key={faixa}
                    value={faixa}
                  >
                    {faixa}
                  </option>
                ))}

              </select>

            </div>

            {/* CATEGORIA */}

            <div>

              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                🏷️ Categoria
              </label>

              <select
                value={categoriaSelecionada}
                onChange={(e) =>
                  setCategoriaSelecionada(e.target.value)
                }
                className="
                  w-full
                  bg-gray-50
                  border border-gray-200
                  rounded-xl
                  px-4 py-3
                  text-gray-700
                  font-semibold
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              >

                <option value="Todas">
                  Todas
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria}
                    value={categoria}
                  >
                    {categoria}
                  </option>
                ))}

              </select>

            </div>

            {/* LOCAL */}

            <div>

              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                📦 Localização
              </label>

              <select
                value={localSelecionado}
                onChange={(e) =>
                  setLocalSelecionado(e.target.value)
                }
                className="
                  w-full
                  bg-gray-50
                  border border-gray-200
                  rounded-xl
                  px-4 py-3
                  text-gray-700
                  font-semibold
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              >

                <option value="Todos">
                  Todos
                </option>

                {locais.map((local) => (
                  <option
                    key={local}
                    value={local}
                  >
                    {local}
                  </option>
                ))}

              </select>

            </div>

            {/* DISPONIBILIDADE */}

            <div>

              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                📚 Disponibilidade
              </label>

              <select
                value={disponibilidade}
                onChange={(e) =>
                  setDisponibilidade(e.target.value)
                }
                className="
                  w-full
                  bg-gray-50
                  border border-gray-200
                  rounded-xl
                  px-4 py-3
                  text-gray-700
                  font-semibold
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              >

                <option value="Todos">
                  Todos
                </option>

                <option value="Disponíveis">
                  Disponíveis
                </option>

                <option value="Indisponíveis">
                  Indisponíveis
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* RESULTADO */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <p className="text-gray-700 font-bold">

              {textoPesquisa
                ? `Resultados para "${pesquisa}"`
                : "Acervo da biblioteca"}

            </p>

            <p className="text-sm text-gray-500 mt-1">

              {livrosFiltrados.length} de{" "}
              {livros.length} livro(s)

            </p>

          </div>

          {filtrosAtivos && (
            <div className="flex flex-wrap gap-2">

              {faixaSelecionada !== "Todas" && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  👶 {faixaSelecionada}
                </span>
              )}

              {categoriaSelecionada !== "Todas" && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  🏷️ {categoriaSelecionada}
                </span>
              )}

              {localSelecionado !== "Todos" && (
                <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  📦 {localSelecionado}
                </span>
              )}

              {disponibilidade !== "Todos" && (
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  ✓ {disponibilidade}
                </span>
              )}

            </div>
          )}

        </div>

        {/* LIVROS */}

        {livrosFiltrados.length > 0 ? (

          <Biblioteca
            livros={livrosFiltrados}
            publico={true}
          />

        ) : (

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 md:p-16 text-center">

            <div className="text-6xl mb-5">
              📚
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">
              Nenhum livro encontrado
            </h2>

            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Não encontramos livros com os filtros selecionados.
              Tente limpar os filtros ou fazer uma nova pesquisa.
            </p>

            <button
              type="button"
              onClick={limparFiltros}
              className="
                mt-6
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-6 py-3
                rounded-xl
                font-bold
                transition
              "
            >
              Limpar filtros
            </button>

          </div>

        )}

      </div>

    </main>
  );
}