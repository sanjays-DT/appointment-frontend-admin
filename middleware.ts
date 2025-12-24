import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdmin } from './lib/auth';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (url.pathname === '/') return NextResponse.next();

  if (url.pathname.startsWith('/dashboard')) {
    const admin = await isAdmin(); 

    if (!admin) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'], 
};
