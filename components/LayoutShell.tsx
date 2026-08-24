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
    pathname === "/login";

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

    async function verificarLogin() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user && ativo) {
        router.replace("/login");
      }
    }

    verificarLogin();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        if (!session && ativo) {
          router.replace("/login");
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

  if (areaAdministrativa) {
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