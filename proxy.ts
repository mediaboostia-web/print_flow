import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Whitelist of unauthenticated public routes
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/super-admin/login',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static files, icons, and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Allow public storefront /catalogue/[orgId] (unauthenticated visitors)
  const isPublicStorefront = pathname.startsWith('/catalogue/') && pathname !== '/catalogue';
  const isPublicPath = PUBLIC_PATHS.includes(pathname) || isPublicStorefront;

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. Server-side Supabase JWT validation for all protected paths
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isSuperAdminArea = pathname.startsWith('/super-admin');

  // If Supabase environment variables are missing on the server, deny protected routes
  if (!supabaseUrl || !supabaseAnonKey) {
    const loginPath = isSuperAdminArea ? '/super-admin/login' : '/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Strictly check validated Supabase Auth session token on server
  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated, redirect immediately to login
  if (!user) {
    const loginPath = isSuperAdminArea ? '/super-admin/login' : '/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // For Super Admin paths (/super-admin/*), verify the user is a superadmin in Postgres
  if (isSuperAdminArea) {
    const { data: saRow } = await supabase
      .from('superadmins')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!saRow) {
      // User is logged in as an org staff member, NOT a Super Admin -> deny access
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
