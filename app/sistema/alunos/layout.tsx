"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseSistema } from "@/lib/supabaseSistema";

const menu = [
  {
    nome: "Dashboard",
    descricao: "Visão geral",
    icone: "⌂",
    href: "/sistema",
  },
  {
    nome: "Alunos",
    descricao: "Cadastro e documentação",
    icone: "👧",
    href: "/sistema/alunos",
  },
  {
    nome: "Turmas",
    descricao: "Turmas e alunos",
    icone: "👩‍🏫",
    href: "/sistema/turmas",
  },
  {
    nome: "Matrículas",
    descricao: "Controle das matrículas",
    icone: "📝",
    href: "/sistema/matriculas",
  },
  {
    nome: "Censo Escolar",
    descricao: "Situação do Censo",
    icone: "🏛️",
    href: "/sistema/censo",
  },
  {
    nome: "Configurações",
    descricao: "Configurações do sistema",
    icone: "⚙️",
    href: "/sistema/configuracoes",
  },
];

export default function SistemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);

    await supabaseSistema.auth.signOut();

    router.push("/sistema-login");
    router.refresh();
  }

  function menuAtivo(href: string) {
    if (href === "/sistema") {
      return pathname === "/sistema";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb]">

      {/* BOTÃO MOBILE */}
      <button
        type="button"
        onClick={() => setMenuAberto(true)}
        className="fixed top-4 left-4 z-[60] lg:hidden w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-xl text-slate-700"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* FUNDO DO MENU MOBILE */}
      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          w-[280px]
          bg-white
          border-r
          border-slate-200
          shadow-xl
          lg:shadow-none
          flex
          flex-col
          transition-transform
          duration-300
          ${
            menuAberto
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* LOGO */}
        <div className="p-4">

          <div className="rounded-2xl bg-gradient-to-br from-[#1748d1] to-[#12358f] p-4 text-white shadow-lg">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">

                <img
                  src="/logo-creche.png"
                  alt="Creche Tesouro Infantil"
                  className="w-10 h-10 object-contain"
                />

              </div>

              <div className="min-w-0">

                <p className="text-[10px] uppercase tracking-[0.16em] text-blue-100 font-bold">
                  Sistema
                </p>

                <h1 className="text-sm font-extrabold leading-tight">
                  Tesouro Infantil
                </h1>

                <p className="text-[10px] text-blue-100 mt-0.5">
                  Gestão administrativa
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* USUÁRIO */}
        <div className="px-4">

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold shrink-0">
                TC
              </div>

              <div className="min-w-0">

                <p className="text-xs uppercase tracking-wide font-bold text-slate-400">
                  Usuário conectado
                </p>

                <p className="text-sm font-extrabold text-slate-700 truncate">
                  Usuário administrativo
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* TÍTULO DO MENU */}
        <div className="px-4 pt-6">

          <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.16em] font-extrabold text-slate-400">
            Menu principal
          </p>

        </div>

        {/* MENU */}
        <nav className="px-3 space-y-1 flex-1 overflow-y-auto">

          {menu.map((item) => {

            const ativo = menuAtivo(item.href);

            return (
              <Link
                key={item.nome}
                href={item.href}
                onClick={() => setMenuAberto(false)}
                className={`
                  group
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  px-3
                  py-3
                  transition-all
                  ${
                    ativo
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  }
                `}
              >

                <div
                  className={`
                    w-10
                    h-10
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-lg
                    shrink-0
                    ${
                      ativo
                        ? "bg-white/15"
                        : "bg-slate-100 group-hover:bg-white"
                    }
                  `}
                >
                  {item.icone}
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-extrabold">
                    {item.nome}
                  </p>

                  <p
                    className={`
                      text-[11px] mt-0.5 truncate
                      ${
                        ativo
                          ? "text-blue-100"
                          : "text-slate-400"
                      }
                    `}
                  >
                    {item.descricao}
                  </p>

                </div>

              </Link>
            );

          })}

        </nav>

        {/* RODAPÉ DA SIDEBAR */}
        <div className="p-4 border-t border-slate-100">

          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3 mb-3">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">
                💙
              </div>

              <div>

                <p className="text-xs font-extrabold text-blue-700">
                  Creche Tesouro Infantil
                </p>

                <p className="text-[10px] text-blue-500 mt-0.5">
                  Ano letivo 2026
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-4 py-3 text-sm font-bold transition disabled:opacity-60"
          >
            <span>↪</span>

            {saindo
              ? "Saindo..."
              : "Sair do sistema"}

          </button>

        </div>

      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="lg:pl-[280px] min-h-screen">

        {/* BARRA SUPERIOR MOBILE */}
        <div className="lg:hidden h-20 flex items-center justify-center px-16 bg-white border-b border-slate-200">

          <div className="flex items-center gap-2">

            <img
              src="/logo-creche.png"
              alt="Creche Tesouro Infantil"
              className="w-9 h-9 object-contain"
            />

            <div>

              <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600">
                Sistema
              </p>

              <p className="text-sm font-extrabold text-slate-700">
                Tesouro Infantil
              </p>

            </div>

          </div>

        </div>

        {/* CONTEÚDO DA PÁGINA */}
        <div className="min-h-screen">
          {children}
        </div>

      </div>

    </div>
  );
}