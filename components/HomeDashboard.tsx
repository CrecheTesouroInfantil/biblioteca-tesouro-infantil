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
      titulo: "Livros",
      valor: totalLivros,
      descricao: "Títulos cadastrados",
      icone: "📚",
      fundo: "bg-blue-50",
      texto: "text-blue-700",
      borda: "border-blue-100",
    },
    {
      titulo: "Exemplares",
      valor: totalExemplares,
      descricao: "Unidades no acervo",
      icone: "📦",
      fundo: "bg-indigo-50",
      texto: "text-indigo-700",
      borda: "border-indigo-100",
    },
    {
      titulo: "Disponíveis",
      valor: disponiveis,
      descricao: "Prontos para empréstimo",
      icone: "✓",
      fundo: "bg-emerald-50",
      texto: "text-emerald-700",
      borda: "border-emerald-100",
    },
    {
      titulo: "Emprestados",
      valor: emprestados,
      descricao: "Em circulação",
      icone: "↗",
      fundo: "bg-orange-50",
      texto: "text-orange-700",
      borda: "border-orange-100",
    },
    {
      titulo: "Reservas",
      valor: reservas,
      descricao: "Aguardando atendimento",
      icone: "⚑",
      fundo: "bg-purple-50",
      texto: "text-purple-700",
      borda: "border-purple-100",
    },
    {
      titulo: "Atrasados",
      valor: atrasados,
      descricao:
        atrasados > 0
          ? "Precisam de atenção"
          : "Nenhum empréstimo atrasado",
      icone: "◷",
      fundo:
        atrasados > 0
          ? "bg-red-50"
          : "bg-emerald-50",
      texto:
        atrasados > 0
          ? "text-red-700"
          : "text-emerald-700",
      borda:
        atrasados > 0
          ? "border-red-100"
          : "border-emerald-100",
    },
  ];

  return (
    <div className="space-y-7">

      {/* INDICADORES */}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">

        {cards.map((card) => (

          <div
            key={card.titulo}
            className={`group bg-white border ${card.borda} rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >

            <div className="flex items-start justify-between gap-3">

              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 ${card.fundo} ${card.texto} rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold`}
              >
                {card.icone}
              </div>

              <div
                className={`hidden sm:block text-xs font-semibold ${card.texto} ${card.fundo} px-3 py-1 rounded-full`}
              >
                Biblioteca
              </div>

            </div>

            <p className="text-gray-500 text-sm sm:text-base font-medium mt-4">
              {card.titulo}
            </p>

            <div className="flex items-end justify-between gap-2 mt-1">

              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${card.texto}`}
              >
                {card.valor}
              </h2>

            </div>

            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {card.descricao}
            </p>

          </div>

        ))}

      </div>

      {/* RESUMO */}

      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">

        <div className="px-5 py-5 sm:px-7 sm:py-6 border-b border-gray-100">

          <div className="flex items-center justify-between gap-4">

            <div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">
                Resumo do acervo
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Visão geral dos exemplares da biblioteca
              </p>

            </div>

            <div className="hidden sm:flex w-11 h-11 bg-blue-50 text-blue-700 rounded-2xl items-center justify-center text-xl">
              📊
            </div>

          </div>

        </div>

        <div className="p-5 sm:p-7">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* TOTAL */}

            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm font-semibold text-blue-700">
                  Total de exemplares
                </p>

                <span className="text-lg">
                  📚
                </span>

              </div>

              <p className="text-3xl font-extrabold text-blue-800 mt-3">
                {totalExemplares}
              </p>

              <p className="text-xs text-blue-600 mt-1">
                Unidades cadastradas
              </p>

            </div>

            {/* DISPONÍVEIS */}

            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm font-semibold text-emerald-700">
                  Disponíveis
                </p>

                <span className="text-lg">
                  ✓
                </span>

              </div>

              <p className="text-3xl font-extrabold text-emerald-700 mt-3">
                {disponiveis}
              </p>

              <p className="text-xs text-emerald-600 mt-1">
                Prontos para empréstimo
              </p>

            </div>

            {/* CIRCULAÇÃO */}

            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm font-semibold text-orange-700">
                  Em circulação
                </p>

                <span className="text-lg">
                  ↗
                </span>

              </div>

              <p className="text-3xl font-extrabold text-orange-700 mt-3">
                {emprestados}
              </p>

              <p className="text-xs text-orange-600 mt-1">
                Livros emprestados
              </p>

            </div>

          </div>

          {/* BARRA DE UTILIZAÇÃO */}

          <div className="mt-7">

            <div className="flex items-center justify-between mb-2">

              <p className="text-sm font-semibold text-gray-700">
                Utilização do acervo
              </p>

              <p className="text-sm font-bold text-gray-600">
                {totalExemplares > 0
                  ? Math.round(
                      (emprestados / totalExemplares) * 100
                    )
                  : 0}
                %
              </p>

            </div>

            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    totalExemplares > 0
                      ? Math.min(
                          (emprestados / totalExemplares) * 100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />

            </div>

            <p className="text-xs text-gray-400 mt-2">
              {emprestados} de {totalExemplares} exemplares estão atualmente em circulação.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}