"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menus = [
    { nome: "🏠 Dashboard", link: "/" },
    { nome: "📚 Biblioteca", link: "/" },
    { nome: "➕ Novo Livro", link: "/cadastro" },
    { nome: "📤 Empréstimos", link: "/emprestimos" },
    { nome: "📊 Relatórios", link: "/relatorios" },
    { nome: "⚙️ Configurações", link: "/configuracoes" },
  ];

  return (
    <aside className="w-72 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-xl">

      <div className="p-8 border-b border-blue-500">

        <h1 className="text-3xl font-bold">
          📚 Biblioteca
        </h1>

        <p className="text-blue-200 mt-2 text-sm">
          Tesouro Infantil
        </p>

      </div>

      <nav className="p-4 space-y-3">

        {menus.map((menu) => (
          <Link
            key={menu.nome}
            href={menu.link}
            className={`block rounded-xl px-5 py-4 transition-all duration-300 ${
              pathname === menu.link
                ? "bg-white text-blue-700 font-bold shadow-lg"
                : "hover:bg-blue-600"
            }`}
          >
            {menu.nome}
          </Link>
        ))}

      </nav>

      <div className="absolute bottom-5 left-5 text-blue-300 text-xs">
        Biblioteca v2.0
      </div>

    </aside>
  );
}