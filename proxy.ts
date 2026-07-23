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

  // 2. Allow public storefront /catalogue/[orgId] & public auth pages
  const isPublicStorefront = pathname.startsWith('/catalogue/') && pathname !== '/catalogue';
  const isPublicPath = PUBLIC_PATHS.includes(pathname) || isPublicStorefront;

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. Check for client-side session cookie or Supabase JWT session
  const hasSessionCookie = request.cookies.get('printflow_session')?.value === 'true';
  const isSuperAdminArea = pathname.startsWith('/super-admin');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let isSupabaseAuthenticated = false;
  let response = NextResponse.next({ request });

  if (supabaseUrl && supabaseAnonKey) {
    try {
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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        isSupabaseAuthenticated = true;
      }
    } catch (err) {
      console.warn("Middleware Supabase auth check warning:", err);
    }
  }

  // Determine if the user is authenticated via cookie or Supabase JWT
  const isAuthenticated = hasSessionCookie || isSupabaseAuthenticated;

  // If not authenticated, redirect immediately to the relevant login page
  if (!isAuthenticated) {
    const loginPath = isSuperAdminArea ? '/super-admin/login' : '/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
