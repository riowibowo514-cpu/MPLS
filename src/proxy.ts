import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-key-bgtk-sumbar-2026'
);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isAdminPath = path.startsWith('/admin');
  const isDashboardPath = path.startsWith('/dashboard');

  if (isAdminPath || isDashboardPath) {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;
      
      // Admin protection
      if (isAdminPath && role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Dashboard protection (Admin & Pimpinan allowed)
      if (isDashboardPath) {
        if (role !== 'admin' && role !== 'pimpinan') {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
      
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
