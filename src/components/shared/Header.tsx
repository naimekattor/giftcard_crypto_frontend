'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { Menu, X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, switchActiveRole, upgradeToRole } = useAuth();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Hide nav on dashboard and auth pages — they have their own chrome
  const isDashboard = pathname?.startsWith('/dashboard') ||
                      pathname?.includes('buyer') ||
                      pathname?.includes('seller-dashboard');
  const isAuth = pathname === '/login' || pathname === '/signup';
  if (isDashboard || isAuth) return null;

  const isActive = (path: string) => pathname === path;
  const linkClass = (path: string) =>
    `text-sm font-bold transition-colors ${isActive(path) ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`;

  const hasBothRoles = user?.roles?.includes('buyer') && user?.roles?.includes('seller');
  const dashboardHref = user?.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer';

  const handleRoleSwitch = async (role: 'buyer' | 'seller') => {
    if (role === user?.role) return;
    setSwitching(true);
    try {
      await switchActiveRole(role);
      router.push(`/dashboard/${role}`);
    } catch (e: any) {
      Swal.fire({
        title: 'Error',
        text: e.message || 'Failed to switch role',
        icon: 'error',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setSwitching(false);
      setDropdownOpen(false);
    }
  };

  const handleUpgrade = async (role: 'buyer' | 'seller') => {
    const result = await Swal.fire({
      title: `Become a ${role === 'seller' ? 'Seller' : 'Buyer'}?`,
      text: `Do you want to add the ${role} role to your existing account? You will be able to switch between Buyer and Seller modes seamlessly!`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, upgrade!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: role === 'seller' ? '#f97316' : '#2563eb',
      cancelButtonColor: '#334155',
      background: '#0f172a',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
      }
    });

    if (!result.isConfirmed) return;

    setSwitching(true);
    try {
      await upgradeToRole(role);
      Swal.fire({
        title: 'Success!',
        text: `You are now a ${role}! Redirecting to your new dashboard.`,
        icon: 'success',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#2563eb',
      });
      router.push(`/dashboard/${role}`);
    } catch (e: any) {
      Swal.fire({
        title: 'Error',
        text: e.message || 'Upgrade failed',
        icon: 'error',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setSwitching(false);
    }
  };

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
                {/* Role Switcher or Upgrade CTA */}
                {hasBothRoles ? (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      disabled={switching}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                    >
                      <span>Mode: {user?.role === 'seller' ? 'Seller 💳' : 'Buyer 🛒'}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={() => handleRoleSwitch('buyer')}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-all flex items-center justify-between ${
                            user?.role === 'buyer' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>Buyer Dashboard</span>
                          <span>🛒</span>
                        </button>
                        <button
                          onClick={() => handleRoleSwitch('seller')}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-all flex items-center justify-between ${
                            user?.role === 'seller' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>Seller Dashboard</span>
                          <span>💳</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(user?.role === 'buyer' ? 'seller' : 'buyer')}
                    disabled={switching}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 ${
                      user?.role === 'buyer'
                        ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500/20'
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20'
                    }`}
                  >
                    🚀 Become a {user?.role === 'buyer' ? 'Seller' : 'Buyer'}
                  </button>
                )}

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
                <div className="px-3 py-2 bg-slate-50 rounded-xl space-y-2 mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dashboard Mode</p>
                  {hasBothRoles ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRoleSwitch('buyer')}
                        disabled={switching}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                          user?.role === 'buyer' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        🛒 Buyer
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('seller')}
                        disabled={switching}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                          user?.role === 'seller' ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        💳 Seller
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(user?.role === 'buyer' ? 'seller' : 'buyer')}
                      disabled={switching}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold text-center transition-all disabled:opacity-50 ${
                        user?.role === 'buyer' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                      }`}
                    >
                      🚀 Become a {user?.role === 'buyer' ? 'Seller' : 'Buyer'}
                    </button>
                  )}
                </div>

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
