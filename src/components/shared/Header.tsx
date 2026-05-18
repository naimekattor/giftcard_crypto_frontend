'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  // Hide nav on dashboard and auth pages — they have their own chrome
  const isDashboard = pathname?.startsWith('/dashboard') ||
                      pathname?.includes('buyer') ||
                      pathname?.includes('seller-dashboard');
  const isAuth = pathname === '/login' || pathname === '/signup';
  if (isDashboard || isAuth) return null;

  const isActive = (path: string) => pathname === path;
  const linkClass = (path: string) =>
    `text-sm font-bold transition-colors ${isActive(path) ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`;

  const dashboardHref = user?.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer';

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-4">

          {/* Logo */}
            <Link href="/" className="inline-block mb-6">
              <Image src="/logo.png" alt="GiftCard Market" width={150} height={40} />
            </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={linkClass('/')}>Home</Link>
            <Link href="/buy-gift-cards" className={linkClass('/buy-gift-cards')}>Buy Cards</Link>
            <Link href="/seller" className={linkClass('/seller')}>Sell Cards</Link>
            <Link href="/how-it-works" className={linkClass('/how-it-works')}>How It Works</Link>

            {isAuthenticated ? (
              <>
                <Link href={dashboardHref} className={linkClass(dashboardHref)}>Dashboard</Link>
                <div className="h-5 w-px bg-slate-200" />
                <span className="text-xs font-medium text-slate-400 max-w-[120px] truncate">{user?.email}</span>
                <button
                  onClick={logout}
                  className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                  Log in
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/20">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-600">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-5 space-y-1 border-t border-slate-100 pt-4">
            {[['/', 'Home'], ['/buy-gift-cards', 'Buy Cards'], ['/seller', 'Sell Cards'],['/how-it-works', 'How it works']].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setIsOpen(false)}
                className="block px-3 py-3 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                {label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link href={dashboardHref} onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl">
                  Dashboard
                </Link>
                <button onClick={() => { logout(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-3 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">
                  Sign out
                </button>
              </>
            ) : (
              <div className="pt-3 flex flex-col gap-2 px-3">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-2.5 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all">
                    Log in
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-all">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
