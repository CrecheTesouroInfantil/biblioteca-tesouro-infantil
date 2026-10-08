"use client";

import Link from "next/link";

type Modelo = {
  titulo: string;
  descricao: string;
  icone: string;
  href: string;
  cor: "blue" | "green" | "yellow" | "purple";
  acao: string;
};

const modelos: Modelo[] = [
  {
    titulo: "Termo de Uso de Imagem e Voz",
    descricao:
      "Preencha os dados da criança e do responsável e gere o termo com as opções AUTORIZO ou NÃO AUTORIZO.",
    icone: "📸",
    href: "/sistema/impressao/imagem",
    cor: "blue",
    acao: "Abrir termo",
  },
  {
    titulo: "Termo de Retirada de Aluno",
    descricao:
      "Cadastre as pessoas autorizadas a retirar a criança e imprima o termo para assinatura do responsável.",
    icone: "👤",
    href: "/sistema/impressao/retirada",
    cor: "green",
    acao: "Abrir termo",
  },
  {
    titulo: "Bilhete de Documentos Pendentes",
    descricao:
      "Gere um bilhete informando os documentos que ainda precisam ser entregues pelo responsável.",
    icone: "📄",
    href: "/sistema/impressao/documentos",
    cor: "yellow",
    acao: "Gerar bilhete",
  },
  {
    titulo: "Lista de Alunos",
    descricao:
      "Selecione a turma e gere uma lista de alunos pronta para impressão em folha A4.",
    icone: "👧",
    href: "/sistema/impressao/alunos",
    cor: "purple",
    acao: "Abrir lista",
  },
];

const estilos = {
  blue: {
    fundo: "bg-blue-50",
    icone: "bg-blue-100 text-blue-700",
    borda: "border-blue-100",
    titulo: "text-blue-800",
    botao: "bg-blue-600 hover:bg-blue-700",
  },
  green: {
    fundo: "bg-emerald-50",
    icone: "bg-emerald-100 text-emerald-700",
    borda: "border-emerald-100",
    titulo: "text-emerald-800",
    botao: "bg-emerald-600 hover:bg-emerald-700",
  },
  yellow: {
    fundo: "bg-amber-50",
    icone: "bg-amber-100 text-amber-700",
    borda: "border-amber-100",
    titulo: "text-amber-800",
    botao: "bg-amber-500 hover:bg-amber-600",
  },
  purple: {
    fundo: "bg-violet-50",
    icone: "bg-violet-100 text-violet-700",
    borda: "border-violet-100",
    titulo: "text-violet-800",
    botao: "bg-violet-600 hover:bg-violet-700",
  },
};

export default function ImpressaoPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] p-4 md:p-7">
      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}
        <header className="mb-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Sistema de Gestão
            </p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-800">
              🖨️ Impressão
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              Acesse os modelos de documentos da Creche Tesouro Infantil,
              preencha as informações necessárias e imprima em formato A4.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              📄
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Modelos disponíveis
              </p>

              <p className="text-xl font-extrabold text-slate-800">
                4 documentos
              </p>
            </div>
          </div>
        </header>

        {/* AVISO */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg">
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                🖨️
              </div>

              <div>
                <p className="text-lg font-extrabold">
                  Documentos prontos para impressão
                </p>

                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-blue-100">
                  Escolha um modelo abaixo. Os documentos possuem layout próprio
                  para folha A4 e foram organizados para facilitar o trabalho da
                  secretaria.
                </p>
              </div>
            </div>

            <div className="hidden rounded-2xl bg-white/10 px-5 py-3 text-center md:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                Formato
              </p>

              <p className="mt-0.5 text-lg font-black">
                A4
              </p>
            </div>
          </div>
        </section>

        {/* TÍTULO DOS MODELOS */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-slate-800">
              Modelos de documentos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Selecione o documento que deseja preencher e imprimir.
            </p>
          </div>

          {/* CARTÕES */}
          <div className="grid gap-5 md:grid-cols-2">
            {modelos.map((modelo) => {
              const estilo = estilos[modelo.cor];

              return (
                <article
                  key={modelo.titulo}
                  className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${estilo.borda}`}
                >
                  {/* PARTE COLORIDA */}
                  <div className={`p-6 ${estilo.fundo}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm ${estilo.icone}`}
                      >
                        {modelo.icone}
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                        A4
                      </span>
                    </div>

                    <h3
                      className={`mt-5 text-xl font-extrabold ${estilo.titulo}`}
                    >
                      {modelo.titulo}
                    </h3>

                    <p className="mt-2 min-h-[58px] text-sm leading-relaxed text-slate-600">
                      {modelo.descricao}
                    </p>
                  </div>

                  {/* PARTE INFERIOR */}
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        ✓
                      </span>

                      <span>
                        Pronto para impressão
                      </span>
                    </div>

                    <Link
                      href={modelo.href}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition ${estilo.botao}`}
                    >
                      {modelo.acao}

                      <span>
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* INFORMAÇÃO */}
        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
              💡
            </div>

            <div>
              <h3 className="font-extrabold text-slate-800">
                Dica para a secretaria
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Antes de imprimir, confira os dados preenchidos no documento.
                Os modelos foram preparados para facilitar o preenchimento e a
                impressão em folha A4.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}