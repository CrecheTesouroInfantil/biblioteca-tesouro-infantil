"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const paginaPublica =
    pathname === "/biblioteca" ||
    pathname.startsWith("/livro/") ||
    pathname === "/login" ||
    pathname === "/redefinir-senha";

  const areaAdministrativa =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/cadastro" ||
    pathname.startsWith("/cadastro/") ||
    pathname === "/editar" ||
    pathname.startsWith("/editar/") ||
    pathname === "/emprestimos" ||
    pathname.startsWith("/emprestimos/") ||
    pathname === "/reservas" ||
    pathname.startsWith("/reservas/") ||
    pathname === "/relatorios" ||
    pathname.startsWith("/relatorios/") ||
    pathname === "/turmas" ||
    pathname.startsWith("/turmas/") ||
    pathname === "/configuracoes" ||
    pathname.startsWith("/configuracoes/");

  useEffect(() => {
    if (!areaAdministrativa) {
      return;
    }

    let ativo = true;

    async function verificarSessao() {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!ativo) return;

      if (!session) {
        router.replace("/login");
      }
    }

    verificarSessao();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(
      (event, session) => {
        if (!ativo) return;

        if (event === "SIGNED_OUT") {
          router.replace("/login");
          return;
        }

        if (
          event === "SIGNED_IN" &&
          session
        ) {
          return;
        }
      }
    );

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, [areaAdministrativa, router]);

  if (paginaPublica) {
    return (
      <main className="min-h-screen w-full min-w-0 bg-blue-50">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />

      <main className="min-h-screen w-full min-w-0 bg-blue-50 md:ml-72 md:w-[calc(100%-18rem)]">
        <div className="w-full min-w-0 max-w-full">
          {children}
        </div>
      </main>
    </>
  );
}