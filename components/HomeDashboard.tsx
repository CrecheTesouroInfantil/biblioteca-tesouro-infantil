interface HomeDashboardProps {
  totalLivros: number;
  totalExemplares: number;
  disponiveis: number;
  emprestados: number;
  devolvidos: number;
  reservas: number;
  atrasados: number;
}

export default function HomeDashboard({
  totalLivros,
  totalExemplares,
  disponiveis,
  emprestados,
  devolvidos,
  reservas,
  atrasados,
}: HomeDashboardProps) {
  const cards = [
    {
      emoji: "📚",
      titulo: "Livros",
      valor: totalLivros,
      cor: "text-blue-700",
    },
    {
      emoji: "📦",
      titulo: "Exemplares",
      valor: totalExemplares,
      cor: "text-indigo-600",
    },
    {
      emoji: "✅",
      titulo: "Disponíveis",
      valor: disponiveis,
      cor: "text-green-600",
    },
    {
      emoji: "📤",
      titulo: "Emprestados",
      valor: emprestados,
      cor: "text-orange-600",
    },
    {
      emoji: "📌",
      titulo: "Reservas",
      valor: reservas,
      cor: "text-purple-600",
    },
    {
      emoji: "⏰",
      titulo: "Atrasados",
      valor: atrasados,
      cor:
        atrasados > 0
          ? "text-red-600"
          : "text-green-600",
    },
  ];

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

        {cards.map((card) => (

          <div
            key={card.titulo}
            className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition"
          >

            <div className="text-4xl">
              {card.emoji}
            </div>

            <p className="text-gray-500 mt-4">
              {card.titulo}
            </p>

            <h2
              className={`text-4xl font-bold mt-2 ${card.cor}`}
            >
              {card.valor}
            </h2>

          </div>

        ))}

      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6">

        <h2 className="text-2xl font-bold text-blue-700 mb-5">
          📊 Resumo do acervo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-blue-50 rounded-2xl p-5">
            <p className="text-gray-600">
              Total de exemplares
            </p>

            <p className="text-3xl font-bold text-blue-700 mt-1">
              {totalExemplares}
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-5">
            <p className="text-gray-600">
              Disponíveis para empréstimo
            </p>

            <p className="text-3xl font-bold text-green-600 mt-1">
              {disponiveis}
            </p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-5">
            <p className="text-gray-600">
              Em circulação
            </p>

            <p className="text-3xl font-bold text-orange-600 mt-1">
              {emprestados}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}