import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-key-bgtk-sumbar-2026'
);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect ONLY admin routes as per user request
  const isAdminPath = path.startsWith('/admin');

  if (isAdminPath) {
    const token = request.cookies.get('session')?.value;
    
    // Redirect to login if no token
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;
      
      // Strict admin check
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
