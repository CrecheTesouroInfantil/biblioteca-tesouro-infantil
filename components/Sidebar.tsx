"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

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

  return (
    <aside className="w-72 min-h-screen sticky top-0 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950 text-white shadow-2xl flex flex-col">

      <div className="p-8 border-b border-blue-500">

        <h1 className="text-3xl font-extrabold">
          📚 Biblioteca
        </h1>

        <p className="text-blue-200 mt-2">
          Tesouro Infantil
        </p>

      </div>

      <nav className="flex-1 p-5 space-y-2">

        {menus.map((menu) => {

          const ativo =
            menu.link === "/"
              ? pathname === "/"
              : pathname.startsWith(menu.link);

          return (
            <Link
              key={menu.nome}
              href={menu.link}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 ${
                ativo
                  ? "bg-white text-blue-700 font-bold shadow-lg scale-[1.02]"
                  : "text-blue-100 hover:bg-blue-600 hover:translate-x-1"
              }`}
            >
              <span className="text-2xl">
                {menu.emoji}
              </span>

              <span>
                {menu.nome}
              </span>
            </Link>
          );

        })}

      </nav>

      <div className="border-t border-blue-600 p-6">

        <p className="text-blue-200 text-sm">
          Biblioteca Tesouro Infantil
        </p>

        <p className="text-blue-400 text-xs mt-1">
          Versão 3.0
        </p>

      </div>

    </aside>
  );
}