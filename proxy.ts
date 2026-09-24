import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const caminho = request.nextUrl.pathname;

  /*
   * ============================================================
   * ROTAS DA BIBLIOTECA
   * ============================================================
   */

  const areaAdministrativaBiblioteca =
    caminho === "/admin" ||
    caminho.startsWith("/admin/") ||
    caminho === "/cadastro" ||
    caminho.startsWith("/cadastro/") ||
    caminho === "/editar" ||
    caminho.startsWith("/editar/") ||
    caminho === "/emprestimos" ||
    caminho.startsWith("/emprestimos/") ||
    caminho === "/reservas" ||
    caminho.startsWith("/reservas/") ||
    caminho === "/relatorios" ||
    caminho.startsWith("/relatorios/");

  /*
   * ============================================================
   * ROTAS DO SISTEMA TESOURO INFANTIL
   * ============================================================
   */

  const areaAdministrativaSistema =
    caminho === "/" ||
    caminho === "/alunos" ||
    caminho.startsWith("/alunos/") ||
    caminho === "/turmas" ||
    caminho.startsWith("/turmas/") ||
    caminho === "/matriculas" ||
    caminho.startsWith("/matriculas/") ||
    caminho === "/censo" ||
    caminho.startsWith("/censo/") ||
    caminho === "/configuracoes" ||
    caminho.startsWith("/configuracoes/");

  /*
   * ============================================================
   * LOGIN DO SISTEMA
   *
   * A própria página de login precisa ficar pública.
   * ============================================================
   */

  const paginaLoginSistema =
    caminho === "/sistema-login";

  /*
   * ============================================================
   * PÁGINA DE LOGIN DA BIBLIOTECA
   *
   * A própria página de login também precisa ficar pública.
   * ============================================================
   */

  const paginaLoginBiblioteca =
    caminho === "/login";

  /*
   * ============================================================
   * SE NÃO FOR UMA ROTA PROTEGIDA, NÃO FAZ NADA
   * ============================================================
   */

  if (
    !areaAdministrativaBiblioteca &&
    !areaAdministrativaSistema &&
    !paginaLoginSistema &&
    !paginaLoginBiblioteca
  ) {
    return NextResponse.next();
  }

  /*
   * ============================================================
   * BIBLIOTECA
   * ============================================================
   */

  if (areaAdministrativaBiblioteca) {
    let response = NextResponse.next({
      request,
    });

    const supabaseBiblioteca = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });

            response = NextResponse.next({
              request,
            });

            cookiesToSet.forEach(
              ({ name, value, options }) => {
                response.cookies.set(
                  name,
                  value,
                  options
                );
              }
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseBiblioteca.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();

      url.pathname = "/login";

      return NextResponse.redirect(url);
    }

    return response;
  }

  /*
   * ============================================================
   * SISTEMA TESOURO INFANTIL
   * ============================================================
   */

  if (areaAdministrativaSistema) {
    let response = NextResponse.next({
      request,
    });

    const supabaseSistema = createServerClient(
      process.env.NEXT_PUBLIC_SISTEMA_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SISTEMA_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });

            response = NextResponse.next({
              request,
            });

            cookiesToSet.forEach(
              ({ name, value, options }) => {
                response.cookies.set(
                  name,
                  value,
                  options
                );
              }
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseSistema.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();

      url.pathname = "/sistema-login";

      return NextResponse.redirect(url);
    }

    return response;
  }

  /*
   * ============================================================
   * PÁGINAS DE LOGIN
   * ============================================================
   *
   * /login e /sistema-login ficam públicas.
   */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};