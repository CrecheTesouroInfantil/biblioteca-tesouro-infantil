import Image from "next/image";
import Link from "next/link";

interface LivroProps {
  livro: any;
}

export default function LivroCard({ livro }: LivroProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden">

      {livro.capa && (
        <Image
          src={livro.capa}
          alt={livro.nome}
          width={400}
          height={600}
          className="w-full h-80 object-cover"
        />
      )}

      <div className="p-5">

        <h2 className="text-xl font-bold text-blue-700 mb-3">
          {livro.nome}
        </h2>

        <p><strong>Autor:</strong> {livro.autor}</p>
        <p><strong>Categoria:</strong> {livro.categoria || "-"}</p>
        <p><strong>Faixa etária:</strong> {livro.faixa_etaria || "-"}</p>
        <p><strong>Local:</strong> {livro.local || "-"}</p>
        <p><strong>Quantidade:</strong> {livro.quantidade || 0}</p>

        <div className="flex gap-2 mt-5">

          <Link
            href={`/editar/${livro.id}`}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-center py-2 rounded-lg"
          >
            ✏️ Editar
          </Link>

          <button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
          >
            🗑️ Excluir
          </button>

        </div>

      </div>

    </div>
  );
}