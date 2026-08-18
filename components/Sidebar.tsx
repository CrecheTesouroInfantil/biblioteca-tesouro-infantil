"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const menus = [
    {
      nome: "Dashboard",
      emoji: "🏠",
      link: "/",
    },
    {
      nome: "Biblioteca",
      emoji: "📚",
      link: "/biblioteca",
    },
    {
      nome: "Turmas",
      emoji: "👶",
      link: "/turmas",
    },
    {
      nome: "Novo Livro",
      emoji: "➕",
      link: "/cadastro",
    },
    {
      nome: "Empréstimos",
      emoji: "📤",
      link: "/emprestimos",
    },
    {
      nome: "Reservas",
      emoji: "📌",
      link: "/reservas",
    },
    {
      nome: "Relatórios",
      emoji: "📊",
      link: "/relatorios",
    },
    {
      nome: "Configurações",
      emoji: "⚙️",
      link: "/configuracoes",
    },
  ];

  function fecharMenu() {
    setAberto(false);
  }

  return (
    <>
      {/* Botão do menu no celular */}
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="md:hidden fixed top-4 left-4 z-[60] flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-2xl text-white shadow-lg"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* Fundo escuro */}
      {aberto && (
        <button
          type="button"
          onClick={fecharMenu}
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          aria-label="Fechar menu"
        />
      )}

      {/* Menu */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72
          bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950
          text-white shadow-2xl
          flex flex-col
          transition-transform duration-300
          ${aberto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Cabeçalho */}
        <div className="flex-shrink-0 border-b border-blue-500 p-6 md:p-8">

          <div className="flex items-start justify-between">

            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">
                📚 Biblioteca
              </h1>

              <p className="mt-1 text-blue-200 md:mt-2">
                Tesouro Infantil
              </p>
            </div>

            <button
              type="button"
              onClick={fecharMenu}
              className="md:hidden text-2xl text-white"
              aria-label="Fechar menu"
            >
              ✕
            </button>

          </div>

        </div>

        {/* Menus */}
        <nav className="flex-1 overflow-y-auto p-4 md:p-5">

          <div className="space-y-1 md:space-y-2">

            {menus.map((menu) => {

              const ativo =
                menu.link === "/"
                  ? pathname === "/"
                  : pathname.startsWith(menu.link);

              return (
                <Link
                  key={menu.nome}
                  href={menu.link}
                  onClick={fecharMenu}
                  className={`
                    flex items-center gap-4
                    rounded-2xl
                    px-4 py-3 md:px-5 md:py-4
                    transition-all duration-300
                    ${
                      ativo
                        ? "bg-white text-blue-700 font-bold shadow-lg"
                        : "text-blue-100 hover:bg-blue-600 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="text-2xl">
                    {menu.emoji}
                  </span>

                  <span className="text-base md:text-lg">
                    {menu.nome}
                  </span>
                </Link>
              );

            })}

          </div>

        </nav>

        {/* Rodapé */}
        <div className="flex-shrink-0 border-t border-blue-600 p-5 md:p-6">

          <p className="text-sm text-blue-200">
            Biblioteca Tesouro Infantil
          </p>

          <p className="mt-1 text-xs text-blue-400">
            Versão 3.0
          </p>

        </div>

      </aside>
    </>
  );
}