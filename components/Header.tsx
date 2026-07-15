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
    <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">

      <div className="flex flex-col lg:flex-row justify-between gap-6">

        <div>

          <h1 className="text-4xl font-bold text-blue-700">
            📚 Biblioteca Tesouro Infantil
          </h1>

          <p className="text-gray-500 mt-2">
            Consulte todo o acervo da creche.
          </p>

        </div>

        <Link
          href="/cadastro"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center"
        >
          ➕ Novo Livro
        </Link>

      </div>

      <input
        type="text"
        placeholder="🔎 Pesquise por nome, autor, categoria ou caixa..."
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        className="mt-8 w-full border rounded-2xl p-4 text-lg"
      />

    </div>
  );
}