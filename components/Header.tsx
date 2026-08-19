import Link from "next/link";

interface HeaderProps {
  pesquisa: string;
  setPesquisa: (valor: string) => void;
}

export default function Header({
  pesquisa,
  setPesquisa,
}: HeaderProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 mb-6">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div className="min-w-0">

          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            📚 Biblioteca Tesouro Infantil
          </h1>

          <p className="text-gray-500 mt-1">
            Consulte e gerencie o acervo da creche.
          </p>

        </div>

        <Link
          href="/cadastro"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center whitespace-nowrap"
        >
          ➕ Novo Livro
        </Link>

      </div>

      <div className="relative mt-5">

        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
          🔎
        </span>

        <input
          type="text"
          placeholder="Pesquisar por nome, autor, categoria, caixa, faixa ou código..."
          value={pesquisa}
          onChange={(e) =>
            setPesquisa(e.target.value)
          }
          className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {pesquisa && (
          <button
            type="button"
            onClick={() => setPesquisa("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 w-8 h-8 rounded-full font-bold"
            aria-label="Limpar pesquisa"
          >
            ✕
          </button>
        )}

      </div>

    </div>
  );
}