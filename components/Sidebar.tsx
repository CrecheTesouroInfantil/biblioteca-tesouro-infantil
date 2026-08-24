"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [usuario, setUsuario] = useState<User | null>(null);

  const menus = [
    {
      nome: "Dashboard",
      icone: "⌂",
      link: "/",
    },
    {
      nome: "Biblioteca",
      icone: "▤",
      link: "/biblioteca",
    },
    {
      nome: "Turmas",
      icone: "●",
      link: "/turmas",
    },
    {
      nome: "Novo Livro",
      icone: "+",
      link: "/cadastro",
    },
    {
      nome: "Empréstimos",
      icone: "↗",
      link: "/emprestimos",
    },
    {
      nome: "Reservas",
      icone: "⚑",
      link: "/reservas",
    },
    {
      nome: "Relatórios",
      icone: "▥",
      link: "/relatorios",
    },
    {
      nome: "Configurações",
      icone: "⚙",
      link: "/configuracoes",
    },
  ];

  useEffect(() => {
    let ativo = true;

    async function carregarUsuario() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (ativo) {
        setUsuario(user);
      }
    }

    carregarUsuario();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        if (ativo) {
          setUsuario(session?.user ?? null);
        }
      }
    );

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  function fecharMenu() {
    setAberto(false);
  }

  async function sair() {
    if (saindo) return;

    setSaindo(true);

    const { error } =
      await supabaseBrowser.auth.signOut();

    if (error) {
      console.log(error);
      setSaindo(false);
      return;
    }

    setUsuario(null);
    fecharMenu();

    router.replace("/login");
    router.refresh();
  }

  const emailUsuario =
    usuario?.email || "Usuário administrativo";

  return (
    <>
      {/* BOTÃO MOBILE */}

      <button
        type="button"
        onClick={() => setAberto(true)}
        className="
          md:hidden
          fixed top-4 left-4 z-[70]
          w-12 h-12
          rounded-2xl
          bg-blue-700
          text-white
          flex items-center justify-center
          shadow-xl
          border border-white/20
          text-xl
        "
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* FUNDO MOBILE */}

      {aberto && (
        <button
          type="button"
          onClick={fecharMenu}
          className="
            md:hidden
            fixed inset-0 z-[60]
            bg-slate-950/50
            backdrop-blur-sm
          "
          aria-label="Fechar menu"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed top-0 left-0 z-[65]
          h-screen w-[280px]
          bg-gradient-to-b from-[#1744c7] via-[#123ba8] to-[#102e82]
          text-white
          shadow-[12px_0_40px_rgba(15,45,120,0.18)]
          flex flex-col
          transition-transform duration-300 ease-out
          ${aberto ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >

        {/* CABEÇALHO */}

        <div className="px-5 pt-6 pb-5">

          <div
            className="
              bg-white/10
              border border-white/10
              rounded-3xl
              p-4
              backdrop-blur-sm
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  w-14 h-14
                  rounded-2xl
                  bg-white
                  flex items-center justify-center
                  shadow-lg
                  shrink-0
                "
              >
                <img
                  src="/logo-creche.png"
                  alt="Creche Tesouro Infantil"
                  className="w-11 h-11 object-contain"
                />
              </div>

              <div className="min-w-0">

                <p className="text-[10px] uppercase tracking-[0.18em] text-blue-200 font-bold">
                  Sistema
                </p>

                <h1 className="text-lg font-extrabold leading-tight">
                  Biblioteca
                </h1>

                <p className="text-xs text-blue-100 mt-0.5">
                  Tesouro Infantil
                </p>

              </div>

              <button
                type="button"
                onClick={fecharMenu}
                className="
                  md:hidden
                  ml-auto
                  w-8 h-8
                  rounded-xl
                  bg-white/10
                  text-white
                  flex items-center justify-center
                "
                aria-label="Fechar menu"
              >
                ✕
              </button>

            </div>

          </div>

        </div>

        {/* USUÁRIO LOGADO */}

        <div className="px-4 pb-4">

          <div
            className="
              rounded-2xl
              bg-white/10
              border border-white/10
              px-4 py-3
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  w-10 h-10
                  rounded-xl
                  bg-white
                  text-blue-700
                  flex items-center justify-center
                  font-extrabold
                  shrink-0
                "
              >
                👤
              </div>

              <div className="min-w-0">

                <p className="text-[10px] uppercase tracking-[0.14em] text-blue-200 font-bold">
                  Usuário conectado
                </p>

                <p
                  className="text-xs text-white font-semibold truncate mt-0.5"
                  title={emailUsuario}
                >
                  {emailUsuario}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* MENU */}

        <nav className="flex-1 overflow-y-auto px-4 pb-5">

          <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.18em] font-bold text-blue-200">
            Menu principal
          </p>

          <div className="space-y-1.5">

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
                    group
                    flex items-center gap-3
                    rounded-2xl
                    px-3 py-3
                    transition-all duration-200
                    ${
                      ativo
                        ? "bg-white text-blue-700 shadow-lg"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >

                  <span
                    className={`
                      w-10 h-10
                      rounded-xl
                      flex items-center justify-center
                      text-lg font-bold
                      shrink-0
                      transition
                      ${
                        ativo
                          ? "bg-blue-50 text-blue-700"
                          : "bg-white/10 text-white group-hover:bg-white/15"
                      }
                    `}
                  >
                    {menu.icone}
                  </span>

                  <span
                    className={`
                      text-sm
                      ${
                        ativo
                          ? "font-extrabold"
                          : "font-semibold"
                      }
                    `}
                  >
                    {menu.nome}
                  </span>

                  {ativo && (
                    <span className="ml-auto text-blue-600 text-sm">
                      ●
                    </span>
                  )}

                </Link>
              );

            })}

          </div>

        </nav>

        {/* RODAPÉ */}

        <div className="px-4 pb-5">

          <div
            className="
              rounded-2xl
              bg-white/10
              border border-white/10
              px-4 py-4
            "
          >

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                📚
              </div>

              <div className="min-w-0">

                <p className="text-xs font-bold text-white">
                  Tesouro Infantil
                </p>

                <p className="text-[10px] text-blue-200 mt-0.5">
                  Biblioteca escolar
                </p>

              </div>

            </div>

            <div className="mt-3 pt-3 border-t border-white/10">

              <button
                type="button"
                onClick={sair}
                disabled={saindo}
                className="
                  w-full
                  flex items-center justify-center gap-2
                  rounded-xl
                  bg-white/10
                  hover:bg-red-500/90
                  disabled:opacity-60
                  px-3 py-2.5
                  text-xs
                  font-bold
                  text-white
                  transition
                "
              >
                <span>
                  {saindo ? "..." : "↪"}
                </span>

                <span>
                  {saindo
                    ? "Saindo..."
                    : "Sair da conta"}
                </span>
              </button>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">

                <span className="text-[10px] text-blue-200">
                  Sistema
                </span>

                <span className="text-[10px] font-bold text-blue-100">
                  v3.0
                </span>

              </div>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
}