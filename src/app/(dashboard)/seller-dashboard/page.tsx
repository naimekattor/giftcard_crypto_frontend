'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { sellerApi, type CardRecord } from '@/services/dashboardApi';
import Image from 'next/image';
const statusStyles: Record<string, string> = {
  active:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  sold:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};
const statusIcons: Record<string, string> = { active: '🟢', sold: '🔵', cancelled: '⚫' };

const currencySymbols: Record<string, string> = { GBP: '£', USD: '$', CAD: 'C$' };

export default function SellerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const logout = useLogout();
  const router = useRouter();

  const [cards, setCards] = useState<CardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await sellerApi.getCards(user.token);
      setCards(data);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    else if (user) load();
  }, [authLoading, user, load, router]);

  const handleCancel = async (id: number) => {
    if (!user) return;
    if (!confirm('Are you sure you want to cancel this listing?')) return;
    setActionLoading(id);
    try {
      await sellerApi.cancelCard(user.token, id);
      showToast('Card cancelled successfully.', 'success');
      load();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: cards.length,
    active: cards.filter(c => c.status === 'active').length,
    sold: cards.filter(c => c.status === 'sold').length,
    cancelled: cards.filter(c => c.status === 'cancelled').length,
    totalEarnings: cards.filter(c => c.status === 'sold').reduce((s, c) => s + (c.price || 0), 0),
  };

  if (authLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl font-medium text-sm transition-all ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-white/5 z-40 flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-block mb-6">
              <Image src="/logo.png" alt="GiftCard Market" width={150} height={40} className="" />
            </Link>
              
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <div className="bg-orange-600/20 text-orange-400 rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Listings
            </div>
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
            <Link
              href="/marketplace"
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              View Marketplace
            </Link>
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="mb-3 px-3 py-2 bg-white/5 rounded-xl">
              <p className="text-xs text-slate-500">Logged in as</p>
              <p className="text-sm font-medium text-slate-300 truncate">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Seller</span>
            </div>
            <button
              onClick={logout}
              className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2 flex items-center gap-2 text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:ml-64 flex-1 min-h-screen flex flex-col">
          {/* Top bar (mobile) */}
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
            <span className="font-bold text-white text-sm">Seller Dashboard</span>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white">Seller Dashboard</h1>
                <p className="text-slate-400 mt-1 text-sm">Manage your gift card listings</p>
              </div>
              <Link href="/seller">
                <button className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  List New Card
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
              {[
                { label: 'Total Listings', value: stats.total, icon: '📋', color: 'from-slate-700 to-slate-800' },
                { label: 'Active', value: stats.active, icon: '🟢', color: 'from-emerald-700 to-emerald-900' },
                { label: 'Sold', value: stats.sold, icon: '🔵', color: 'from-blue-700 to-blue-900' },
                { label: 'Earned (ETH)', value: stats.totalEarnings.toFixed(6), icon: '⟠', color: 'from-orange-700 to-orange-900' },
              ].map((s) => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 lg:p-5 shadow-xl`}>
                  <div className="text-xl lg:text-2xl mb-1 lg:mb-2">{s.icon}</div>
                  <p className="text-xl lg:text-3xl font-black text-white">{s.value}</p>
                  <p className="text-white/70 text-xs lg:text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Listings table */}
            <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-bold text-white">My Listings</h2>
                <span className="text-sm text-slate-500">{stats.total} total</span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <div className="w-8 h-8 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mb-4" />
                  Loading your listings…
                </div>
              ) : cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <div className="text-5xl mb-4">💳</div>
                  <p className="text-lg font-semibold text-slate-400">No listings yet</p>
                  <p className="text-sm mt-1 mb-6">Start selling your gift cards today</p>
                  <Link href="/seller">
                    <button className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold text-sm transition-all">
                      List a Card
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Card', 'Region', 'Face Value', 'Asking Price', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {cards.map((card) => {
                          const sym = currencySymbols[card.currency] || '$';
                          return (
                            <tr key={card.id} className="hover:bg-white/2 transition-colors">
                              <td className="px-4 lg:px-6 py-4">
                                <div>
                                  <p className="font-semibold text-white text-sm">{card.name}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{card.retailer}</p>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-4">
                                <div className="flex items-center gap-2 whitespace-nowrap">
                                  <span className="text-lg">
                                    {card.region === 'UK' ? '🇬🇧' : card.region === 'USA' ? '🇺🇸' : '🇨🇦'}
                                  </span>
                                  <span className="text-sm text-slate-300">{card.region}</span>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-white whitespace-nowrap">
                                {sym}{card.denomination?.toFixed(2) ?? '—'}
                              </td>
                              <td className="px-4 lg:px-6 py-4 text-sm font-mono text-slate-300 whitespace-nowrap">
                                {card.price.toFixed(6)} ETH
                              </td>
                              <td className="px-4 lg:px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${statusStyles[card.status] || statusStyles.cancelled}`}>
                                  {statusIcons[card.status]} {card.status}
                                </span>
                              </td>
                              <td className="px-4 lg:px-6 py-4">
                                {card.status === 'active' && (
                                  <button
                                    id={`cancel-card-${card.id}`}
                                    disabled={actionLoading === card.id}
                                    onClick={() => handleCancel(card.id)}
                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20 transition-all disabled:opacity-50 whitespace-nowrap min-w-[120px]"
                                  >
                                    {actionLoading === card.id ? (
                                      <span className="flex items-center justify-center gap-1">
                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        …
                                      </span>
                                    ) : '✕ Cancel'}
                                  </button>
                                )}
                                {card.status === 'sold' && (
                                  <span className="text-xs text-emerald-400 font-semibold whitespace-nowrap">💰 Sold</span>
                                )}
                                {card.status === 'cancelled' && (
                                  <span className="text-xs text-slate-500 italic whitespace-nowrap">Cancelled</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block sm:hidden divide-y divide-white/5">
                    {cards.map((card) => {
                      const sym = currencySymbols[card.currency] || '$';
                      return (
                        <div key={card.id} className="px-4 py-4 hover:bg-white/2 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-semibold text-white text-sm">{card.name}</p>
                              <p className="text-xs text-slate-500 mt-1">{card.retailer}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ml-2 flex-shrink-0 ${statusStyles[card.status] || statusStyles.cancelled}`}>
                              {statusIcons[card.status]}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                            <div className="bg-white/5 rounded-lg p-2">
                              <p className="text-slate-500">Region</p>
                              <p className="text-white font-semibold mt-1">{card.region === 'UK' ? '🇬🇧' : card.region === 'USA' ? '🇺🇸' : '🇨🇦'} {card.region}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                              <p className="text-slate-500">Face Value</p>
                              <p className="text-white font-semibold mt-1">{sym}{card.denomination?.toFixed(2) ?? '—'}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2">
                              <p className="text-slate-500">Price</p>
                              <p className="text-white font-semibold mt-1">{card.price.toFixed(4)} ETH</p>
                            </div>
                          </div>
                          {card.status === 'active' && (
                            <button
                              id={`cancel-card-${card.id}`}
                              disabled={actionLoading === card.id}
                              onClick={() => handleCancel(card.id)}
                              className="w-full px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20 transition-all disabled:opacity-50"
                            >
                              {actionLoading === card.id ? (
                                <span className="flex items-center justify-center gap-1">
                                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                  </svg>
                                  Cancelling…
                                </span>
                              ) : '✕ Cancel Listing'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
