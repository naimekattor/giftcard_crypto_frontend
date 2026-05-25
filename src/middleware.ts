import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookie = request.cookies.get('gc_jwt_user');
  const userJson = cookie?.value;

  const isBuyerRoute = pathname.startsWith('/buyer') || pathname.startsWith('/dashboard/buyer');
  const isSellerRoute = pathname.startsWith('/dashboard/seller');
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard/admin');

  const isProtectedRoute = isBuyerRoute || isSellerRoute || isAdminRoute;

  if (isProtectedRoute) {
    if (!userJson) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decodedUser = JSON.parse(decodeURIComponent(userJson));
      const activeRole = decodedUser.role;
      const roles = decodedUser.roles || [activeRole];

      if (isAdminRoute) {
        if (activeRole !== 'admin' && !roles.includes('admin')) {
          // Redirect to their default dashboard if not admin
          const redirectPath = roles.includes('seller')
            ? '/dashboard/seller'
            : roles.includes('buyer')
            ? '/dashboard/buyer'
            : '/login';
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      } else if (isSellerRoute) {
        if (activeRole !== 'seller' && !roles.includes('seller')) {
          const redirectPath = roles.includes('admin')
            ? '/admin'
            : roles.includes('buyer')
            ? '/dashboard/buyer'
            : '/login';
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      } else if (isBuyerRoute) {
        if (activeRole !== 'buyer' && !roles.includes('buyer')) {
          const redirectPath = roles.includes('admin')
            ? '/admin'
            : roles.includes('seller')
            ? '/dashboard/seller'
            : '/login';
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      }
    } catch (e) {
      // Invalid JSON or URI encoding -> clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('gc_jwt_user');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/buyer/:path*',
    '/seller/:path*',
    '/admin/:path*',
  ],
};
