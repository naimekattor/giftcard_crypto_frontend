'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';

import { useAuth } from '@/features/auth/contexts/AuthContext';
import { sellerApi, type CardRecord } from '@/services/dashboardApi';

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  sold: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_verification: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  reserved: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const statusIcons: Record<string, string> = {
  active: '🟢',
  sold: '🔵',
  in_verification: '🟡',
  reserved: '🔒',
  cancelled: '⚫',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  sold: 'Sold',
  in_verification: 'In Verification',
  reserved: 'Reserved',
  cancelled: 'Cancelled',
};

// Returns a display status that hides real-time sale timing from sellers
function getDisplayStatus(card: CardRecord): string {
  if (card.status === 'sold') {
    // Only show 'Sold' once escrow is fully completed
    if (card.payment?.status === 'completed') return 'sold';
    // During escrow holding period, show a neutral intermediate status
    return 'in_verification';
  }
  return card.status;
}

const currencySymbols: Record<string, string> = {
  GBP: '£',
  USD: '$',
  CAD: 'C$',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SellerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [cards, setCards] = useState<CardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

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

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel this listing? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, cancel it!',
      background: '#0f172a',
      color: '#fff',
      customClass: {
        popup: 'rounded-3xl border border-white/10 shadow-2xl',
        title: 'text-2xl font-bold',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3',
      },
    });

    if (!result.isConfirmed) return;
    setActionLoading(id);
    try {
      await sellerApi.cancelCard(user.token, id);
      Swal.fire({
        title: 'Cancelled!',
        text: 'Your listing has been successfully cancelled.',
        icon: 'success',
        background: '#0f172a',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-3xl border border-white/10 shadow-2xl',
        },
      });
      load();
    } catch (e: any) {
      Swal.fire({
        title: 'Error!',
        text: e.message || 'Failed to cancel listing',
        icon: 'error',
        background: '#0f172a',
        color: '#fff',
        customClass: {
          popup: 'rounded-3xl border border-white/10 shadow-2xl',
        },
      });
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: cards.length,
    active: cards.filter((c) => c.status === 'active').length,
    sold: cards.filter((c) => ['sold', 'in_verification'].includes(getDisplayStatus(c))).length,
    cancelled: cards.filter((c) => c.status === 'cancelled').length,
    totalEarnings: cards.filter((c) => c.status === 'sold').reduce((s, c) => s + (c.payment?.seller_payout_amount || 0), 0),
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Prevent rendering dashboard if not authenticated (middleware will redirect)
  if (!user) return null;

  return (
    <>
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl font-medium text-sm transition-all ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Seller Dashboard</h1>
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            {[
              { label: 'Total Listings', value: stats.total, icon: '📋' },
              { label: 'Active', value: stats.active, icon: '🟢' },
              { label: 'Sold', value: stats.sold, icon: '🔵' },
              { label: 'Total Earned (ETH)', value: stats.totalEarnings.toFixed(6), icon: '⟠' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-2xl p-4 lg:p-5 shadow-xl border border-white/5">
                <div className="text-xl lg:text-2xl mb-1 lg:mb-2">{s.icon}</div>
                <p className="text-xl lg:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-white/70 text-xs lg:text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

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
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Card', 'Region', 'Gift card Price', 'Payout (ETH)', 'Status', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cards.map((card) => {
                      const sym = currencySymbols[card.currency ?? 'USD'] || '$';
                      return (
                        <tr key={card.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center gap-3">
                              {card.file_path ? (
                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-white p-1 flex items-center justify-center">
                                  <img
                                    src={`${API_BASE}/${card.file_path}`}
                                    alt={card.name || card.retailer || 'Retailer logo'}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                  <span className="text-lg">🪪</span>
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-white text-sm">{card.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{card.retailer}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 lg:px-6 py-4 text-sm text-slate-300 whitespace-nowrap">{card.region}</td>
                          <td className="px-4 lg:px-6 py-4 text-sm font-mono text-slate-400 whitespace-nowrap">
                            {sym}
                            {card.price}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm font-mono text-white whitespace-nowrap">
                            {card.payment?.seller_payout_amount ? `${card.payment.seller_payout_amount.toFixed(6)} ETH` : '—'}
                          </td>

                          <td className="px-4 lg:px-6 py-4">
                            {(() => {
                              const displayStatus = getDisplayStatus(card);
                              return (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${
                                    statusStyles[displayStatus] || statusStyles.cancelled
                                  }`}
                                >
                                  {statusIcons[displayStatus]} {statusLabels[displayStatus] || displayStatus}
                                </span>
                              );
                            })()}
                          </td>

                          <td className="px-4 lg:px-6 py-4">
                            {card.status === 'active' ? (
                              <button
                                id={`cancel-card-${card.id}`}
                                disabled={actionLoading === card.id}
                                onClick={() => handleCancel(card.id)}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20 transition-all disabled:opacity-50 whitespace-nowrap min-w-[120px]"
                              >
                                {actionLoading === card.id ? 'Cancelling…' : '✕ Cancel'}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500 italic">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
    </>
  );
}
