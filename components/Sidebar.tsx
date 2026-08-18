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
        onClick={() => setAberto(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-700 text-white w-12 h-12 rounded-xl shadow-lg text-2xl"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* Fundo escuro atrás do menu no celular */}
      {aberto && (
        <button
          onClick={fecharMenu}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`
          fixed md:sticky
          top-0 left-0
          z-50
          w-72
          h-screen
          bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950
          text-white
          shadow-2xl
          flex flex-col
          transform transition-transform duration-300
          ${aberto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-6 md:p-8 border-b border-blue-500">

          <div className="flex items-start justify-between">

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                📚 Biblioteca
              </h1>

              <p className="text-blue-200 mt-1 md:mt-2">
                Tesouro Infantil
              </p>
            </div>

            <button
              onClick={fecharMenu}
              className="md:hidden text-white text-2xl"
              aria-label="Fechar menu"
            >
              ✕
            </button>

          </div>

        </div>

        <nav className="flex-1 p-4 md:p-5 space-y-1 md:space-y-2 overflow-y-auto">

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
                  px-4 md:px-5
                  py-3 md:py-4
                  transition-all duration-300
                  ${
                    ativo
                      ? "bg-white text-blue-700 font-bold shadow-lg md:scale-[1.02]"
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

        </nav>

        <div className="border-t border-blue-600 p-5 md:p-6">

          <p className="text-blue-200 text-sm">
            Biblioteca Tesouro Infantil
          </p>

          <p className="text-blue-400 text-xs mt-1">
            Versão 3.0
          </p>

        </div>

      </aside>
    </>
  );
}