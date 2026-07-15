import DashboardCard from "./DashboardCard";

interface EmprestimosDashboardProps {
  total: number;
  emprestados: number;
  devolvidos: number;
  atrasados: number;
}

export default function EmprestimosDashboard({
  total,
  emprestados,
  devolvidos,
  atrasados,
}: EmprestimosDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

      <DashboardCard
        titulo="Empréstimos"
        valor={total}
        emoji="📚"
      />

      <DashboardCard
        titulo="Emprestados"
        valor={emprestados}
        emoji="📤"
      />

      <DashboardCard
        titulo="Devolvidos"
        valor={devolvidos}
        emoji="✅"
      />

      <DashboardCard
        titulo="Atrasados"
        valor={atrasados}
        emoji="⏰"
      />

    </div>
  );
}