'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useLogout } from '@/features/auth/hooks/useAuth';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading, switchActiveRole, upgradeToRole } = useAuth();
  const logout = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isSeller = pathname.startsWith('/dashboard/seller');
  const title = isSeller ? 'Seller Dashboard' : 'Buyer Dashboard';
  const activeClass = isSeller
    ? 'bg-orange-600/20 text-orange-400'
    : 'bg-blue-600/20 text-blue-400';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-white/5 z-40 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-block mb-6" onClick={() => setSidebarOpen(false)}>
              <Image src="/logo.png" alt="GiftCard Market" width={150} height={40} />
            </Link>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className={`${activeClass} rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold`}>
            {isSeller ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            )}
            {isSeller ? 'My Listings' : 'My Purchases'}
          </div>

          {isSeller && (
            <Link
              href="/seller"
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              List New Card
            </Link>
          )}

          <Link
            href="/buy-gift-cards"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 text-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {isSeller ? 'View Marketplace' : 'Browse Marketplace'}
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="px-3 py-2.5 bg-white/5 rounded-xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Account</p>
            <p className="text-xs font-semibold text-slate-300 truncate mb-2">{user?.email}</p>
            {user?.roles?.includes('buyer') && user?.roles?.includes('seller') ? (
              <button
                onClick={async () => {
                  try {
                    if (isSeller) {
                      await switchActiveRole('buyer');
                      router.push('/dashboard/buyer');
                    } else {
                      await switchActiveRole('seller');
                      router.push('/dashboard/seller');
                    }
                  } catch (err: any) {
                    Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#0f172a', color: '#fff' });
                  }
                }}
                className="w-full py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-between border border-white/10"
              >
                <span>{isSeller ? 'Switch to Buyer' : 'Switch to Seller'}</span>
                <span>{isSeller ? '🛒' : '💳'}</span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  const targetRole = isSeller ? 'buyer' : 'seller';
                  const res = await Swal.fire({
                    title: isSeller ? 'Become a Buyer?' : 'Become a Seller?',
                    text: isSeller
                      ? 'Do you want to buy gift cards on our platform? Upgrade your account instantly!'
                      : 'Do you want to sell gift cards on our platform? Upgrade your account instantly!',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, upgrade!',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: isSeller ? '#2563eb' : '#f97316',
                    cancelButtonColor: '#334155',
                    background: '#0f172a',
                    color: '#fff',
                  });
                  if (res.isConfirmed) {
                    try {
                      await upgradeToRole(targetRole);
                      router.push(isSeller ? '/dashboard/buyer' : '/dashboard/seller');
                    } catch (err: any) {
                      Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#0f172a', color: '#fff' });
                    }
                  }
                }}
                className={`w-full py-1.5 px-3 ${isSeller ? 'bg-blue-600 hover:bg-blue-500' : 'bg-orange-600 hover:bg-orange-500'} text-white rounded-lg text-xs font-bold transition-all text-center`}
              >
                🚀 {isSeller ? 'Become a Buyer' : 'Become a Seller'}
              </button>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2 flex items-center gap-2 text-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:ml-64 flex-1 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-white text-sm">{title}</span>
        </header>

        {children}
      </div>
    </div>
  );
}
