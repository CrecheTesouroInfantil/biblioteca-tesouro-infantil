"use client";

interface DashboardCardProps {
  titulo: string;
  valor: number;
  emoji: string;
}

export default function DashboardCard({
  titulo,
  valor,
  emoji,
}: DashboardCardProps) {
  return (
    <div className="w-full min-w-0 bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      
      <div className="flex items-center justify-between gap-4">
        
        <div className="min-w-0">
          <p className="text-gray-500 text-sm md:text-base font-semibold truncate">
            {titulo}
          </p>

          <p className="text-3xl md:text-4xl font-extrabold text-blue-700 mt-2">
            {valor}
          </p>
        </div>

        <div className="flex-shrink-0 text-4xl md:text-5xl">
          {emoji}
        </div>

      </div>

    </div>
  );
}