interface HomeDashboardProps {
  totalLivros: number;
  emprestados: number;
  devolvidos: number;
  reservas: number;
}

export default function HomeDashboard({
  totalLivros,
  emprestados,
  devolvidos,
  reservas,
}: HomeDashboardProps) {
  const cards = [
    {
      emoji: "📚",
      titulo: "Livros",
      valor: totalLivros,
      cor: "text-blue-700",
    },
    {
      emoji: "📤",
      titulo: "Emprestados",
      valor: emprestados,
      cor: "text-orange-600",
    },
    {
      emoji: "✅",
      titulo: "Devolvidos",
      valor: devolvidos,
      cor: "text-green-600",
    },
    {
      emoji: "📌",
      titulo: "Reservas",
      valor: reservas,
      cor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card) => (

        <div
          key={card.titulo}
          className="bg-white rounded-3xl shadow-lg p-6"
        >

          <div className="text-5xl">
            {card.emoji}
          </div>

          <p className="text-gray-500 mt-4">
            {card.titulo}
          </p>

          <h2 className={`text-4xl font-bold mt-2 ${card.cor}`}>
            {card.valor}
          </h2>

        </div>

      ))}

    </div>
  );
}