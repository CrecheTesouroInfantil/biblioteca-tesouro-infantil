import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const EMAIL_ADMIN_BIBLIOTECA =
  "crechetesouroinfantil@hotmail.com";

export async function proxy(request: NextRequest) {
  const caminho = request.nextUrl.pathname;

  /*
   * =========================================================
   * ROTAS ADMINISTRATIVAS DA BIBLIOTECA
   * =========================================================
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
    caminho.startsWith("/relatorios/") ||

    caminho === "/configuracoes" ||
    caminho.startsWith("/configuracoes/");


  /*
   * =========================================================
   * ROTAS ADMINISTRATIVAS DA SECRETARIA
   *
   * IMPORTANTE:
   * As rotas reais da Secretaria começam com /sistema
   * =========================================================
   */

  const areaAdministrativaSistema =
    caminho === "/sistema" ||
    caminho.startsWith("/sistema/");


  /*
   * =========================================================
   * PÁGINAS DE LOGIN
   * =========================================================
   */

  const paginaLoginSistema =
    caminho === "/sistema-login";

  const paginaLoginBiblioteca =
    caminho === "/login";


  /*
   * =========================================================
   * SE NÃO FOR UMA ÁREA PROTEGIDA,
   * DEIXA PASSAR NORMALMENTE
   * =========================================================
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
   * =========================================================
   * LOGIN / ROTAS ADMINISTRATIVAS DA BIBLIOTECA
   * =========================================================
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


    /*
     * NÃO ESTÁ LOGADA
     *
     * Usuária comum não pode entrar diretamente
     * nas áreas administrativas.
     */

    if (!user) {
      const url = request.nextUrl.clone();

      url.pathname = "/biblioteca";

      return NextResponse.redirect(url);
    }


    /*
     * ESTÁ LOGADA, MAS NÃO É ADMINISTRADORA
     */

    const emailUsuario =
      user.email?.toLowerCase().trim();

    const ehAdministradora =
      emailUsuario ===
      EMAIL_ADMIN_BIBLIOTECA.toLowerCase();


    if (!ehAdministradora) {
      const url = request.nextUrl.clone();

      url.pathname = "/biblioteca";

      return NextResponse.redirect(url);
    }


    /*
     * É ADMINISTRADORA
     *
     * Pode acessar normalmente.
     */

    return response;
  }


  /*
   * =========================================================
   * ROTAS ADMINISTRATIVAS DA SECRETARIA
   * =========================================================
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
   * =========================================================
   * PÁGINAS DE LOGIN
   * =========================================================
   */

  if (paginaLoginSistema || paginaLoginBiblioteca) {
    return NextResponse.next();
  }


  return NextResponse.next();
}


export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};