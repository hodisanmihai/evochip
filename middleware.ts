import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;
  const isGoingToLogin = currentPath === "/admin/login";
  // Verifică dacă ruta e de admin, dar NU este pagina de login în sine
  const isGoingToAdminDashboard =
    currentPath.startsWith("/admin") && !isGoingToLogin;

  // 1. PROTECȚIE: Dacă vrea în dashboard dar NU este logat -> trimite-l la /admin/login
  if (!user && isGoingToAdminDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // 2. RE-DIRECȚIONARE: Dacă ESTE deja logat și accesează /admin/login -> trimite-l în dashboard
  if (user && isGoingToLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin"; // Ajustează aici dacă ai altă pagină principală (ex: /admin/dashboard)
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // Prinde toate rutele care încep cu /admin
  matcher: ["/admin/:path*"],
};
