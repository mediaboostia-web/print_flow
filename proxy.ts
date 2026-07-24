import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Whitelist of unauthenticated public routes
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/boutique',
  '/reset-password',
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

  // 2. Allow the public storefront & public auth pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 3. Check for a real Supabase JWT session
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

  // Determine if the user is authenticated via a real Supabase JWT session
  const isAuthenticated = isSupabaseAuthenticated;

  // If not authenticated, redirect immediately to the login page
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
