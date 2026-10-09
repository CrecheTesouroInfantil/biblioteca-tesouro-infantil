"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

const menu = [
  { nome: "Início", icone: "🏠", link: "/sistema" },
  { nome: "Alunos", icone: "👧", link: "/sistema/alunos" },
  { nome: "Matrículas", icone: "📝", link: "/sistema/matriculas" },
  { nome: "Turmas", icone: "👩‍🏫", link: "/sistema/turmas" },
  { nome: "Progressão", icone: "📈", link: "/sistema/progressao" },
  { nome: "Censo Escolar", icone: "🏛️", link: "/sistema/censo" },
  { nome: "Documentos", icone: "📂", link: "/sistema/documentos" },
  { nome: "Biblioteca", icone: "📚", link: "/biblioteca" },
  { nome: "Impressão", icone: "🖨️", link: "/sistema/impressao" },
  { nome: "Relatórios", icone: "📊", link: "/sistema/relatorios" },
  { nome: "Calendário", icone: "📅", link: "/sistema/calendario" },
  { nome: "Equipe", icone: "👥", link: "/sistema/equipe" },
  { nome: "Configurações", icone: "⚙️", link: "/sistema/configuracoes" },
];

export default function SistemaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="fixed left-4 top-4 z-[90] flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-xl text-white shadow-xl md:hidden"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 md:hidden"
          onClick={() => setAberto(false)}
        />
      )}

      <aside
        className={
          "fixed left-0 top-0 z-[80] flex h-screen w-[280px] flex-col bg-gradient-to-b from-[#1748d1] via-[#123ba8] to-[#102e82] text-white shadow-xl transition-transform duration-300 " +
          (aberto ? "translate-x-0" : "-translate-x-full") +
          " md:translate-x-0"
        }
      >
        <div className="p-5">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white">
                <img
                  src="/logo-creche.png"
                  alt="Creche Tesouro Infantil"
                  className="h-11 w-11 object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                  Sistema de Gestão
                </p>
                <h1 className="text-lg font-extrabold leading-tight">
                  Tesouro Infantil
                </h1>
                <p className="text-xs text-blue-100">
                  Ano letivo 2026
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-blue-200">
            Menu do sistema
          </p>

          <div className="space-y-1.5">
            {menu.map((item) => {
              const ativo =
                item.link === "/sistema"
                  ? pathname === "/sistema"
                  : pathname === item.link ||
                    pathname.startsWith(item.link + "/");

              return (
                <Link
                  key={item.link}
                  href={item.link}
                  onClick={() => setAberto(false)}
                  className={
                    "flex items-center gap-3 rounded-2xl px-3 py-3 transition-all " +
                    (ativo
                      ? "bg-white text-blue-700 shadow-lg"
                      : "text-blue-100 hover:bg-white/10 hover:text-white")
                  }
                >
                  <span
                    className={
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg " +
                      (ativo ? "bg-blue-50" : "bg-white/10")
                    }
                  >
                    {item.icone}
                  </span>

                  <span className="text-sm font-bold">
                    {item.nome}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
              Sistema Tesouro Infantil
            </p>
            <p className="mt-1 text-xs text-blue-100">
              Gestão administrativa - 2026
            </p>
          </div>
        </div>
      </aside>

      <main className="min-h-screen md:ml-[280px]">
        {children}
      </main>
    </div>
  );
}
