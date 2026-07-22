import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Whitelist of public routes (Default Deny architecture for security)
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/super-admin/login',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static files, icons, and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Allow public storefront /catalogue/[orgId] (but NOT internal /catalogue)
  const isPublicStorefront = pathname.startsWith('/catalogue/') && pathname !== '/catalogue';
  const isPublicPath = PUBLIC_PATHS.includes(pathname) || isPublicStorefront;

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. Server-side Supabase JWT validation for all protected paths
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
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

  // Strictly check validated Supabase Auth user token on server
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const isSuperAdminArea = pathname.startsWith('/super-admin');
    const loginPath = isSuperAdminArea ? '/super-admin/login' : '/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
