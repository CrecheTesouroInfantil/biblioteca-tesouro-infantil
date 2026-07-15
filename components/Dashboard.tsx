import DashboardCard from "./DashboardCard";

interface DashboardProps {
  totalLivros: number;
  totalCategorias: number;
  totalCaixas: number;
  totalCapas: number;
}

export default function Dashboard({
  totalLivros,
  totalCategorias,
  totalCaixas,
  totalCapas,
}: DashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

      <DashboardCard
        titulo="Livros"
        valor={totalLivros}
        emoji="📚"
      />

      <DashboardCard
        titulo="Categorias"
        valor={totalCategorias}
        emoji="🏷️"
      />

      <DashboardCard
        titulo="Caixas"
        valor={totalCaixas}
        emoji="📦"
      />

      <DashboardCard
        titulo="Capas"
        valor={totalCapas}
        emoji="🖼️"
      />

    </div>
  );
}