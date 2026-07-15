interface DashboardCardProps {
  titulo: string;
  valor: number | string;
  emoji: string;
}

export default function DashboardCard({
  titulo,
  valor,
  emoji,
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">

      <div className="text-5xl mb-4">
        {emoji}
      </div>

      <p className="text-gray-500">
        {titulo}
      </p>

      <h2 className="text-4xl font-bold text-blue-700 mt-2">
        {valor}
      </h2>

    </div>
  );
}