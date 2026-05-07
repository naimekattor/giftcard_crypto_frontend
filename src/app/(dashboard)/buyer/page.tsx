'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useLogout } from '@/features/auth/hooks/useAuth';
import { buyerApi, type PaymentRecord } from '@/services/dashboardApi';
import Image from 'next/image';

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  holding:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  returned:  'bg-slate-500/10 text-slate-400 border-slate-500/20',
};
const complaintColors: Record<string, string> = {
  none:       'bg-slate-500/10 text-slate-400 border-slate-500/20',
  complained: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  valid:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function BuyerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const logout = useLogout();
  const router = useRouter();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await buyerApi.getPayments(user.token);
      setPayments(data);
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

  const handleComplain = async (id: number) => {
    if (!user) return;
    if (!confirm('File a complaint? This will hold the seller payout for admin review.')) return;
    setActionLoading(id);
    try {
      await buyerApi.complain(user.token, id);
      showToast('Complaint filed. Seller payout is held for admin review.', 'success');
      load();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = async (id: number) => {
    if (!user) return;
    setActionLoading(id);
    try {
      await buyerApi.confirm(user.token, id);
      showToast('Gift card confirmed as valid!', 'success');
      load();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const canViewDetails = (p: PaymentRecord) =>
    ['holding', 'completed'].includes(p.status) &&
    Boolean(p.card?.card_code || p.card?.card_pin);

  const toggleReveal = (paymentId: number) =>
    setRevealed((prev) => ({ ...prev, [paymentId]: !prev[paymentId] }));

  const copy = async (value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      showToast('Copied to clipboard', 'success');
    } catch {
      showToast('Copy failed', 'error');
    }
  };

  const stats = {
    total: payments.length,
    holding: payments.filter(p => p.status === 'holding').length,
    completed: payments.filter(p => p.status === 'completed').length,
    totalSpent: payments
      .filter(p => ['holding', 'completed'].includes(p.status))
      .reduce((s, p) => s + p.amount, 0),
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

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-white/5 z-40 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-block mb-6">
              <Image src="/logo.png" alt="GiftCard Market" width={150} height={40} />
            </Link>
            
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="bg-blue-600/20 text-blue-400 rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            My Purchases
          </div>
          <Link
            href="/marketplace"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 text-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Browse Marketplace
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="mb-3 px-3 py-2 bg-white/5 rounded-xl">
            <p className="text-xs text-slate-500">Logged in as</p>
            <p className="text-sm font-medium text-slate-300 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Buyer</span>
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
      <div className="lg:ml-64 min-h-screen flex flex-col">
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
          <span className="font-bold text-white text-sm">Buyer Dashboard</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-black text-white">Buyer Dashboard</h1>
            <p className="text-slate-400 mt-1 text-sm">Manage your gift card purchases</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            {[
              { label: 'Total Purchases', value: stats.total, icon: '📦', color: 'from-blue-600 to-blue-800' },
              { label: 'In Escrow', value: stats.holding, icon: '🔐', color: 'from-yellow-600 to-yellow-800' },
              { label: 'Completed', value: stats.completed, icon: '✅', color: 'from-emerald-600 to-emerald-800' },
              { label: 'Total Spent ', value: stats.totalSpent.toFixed(6), icon: '⟠', color: 'from-purple-600 to-purple-800' },
            ].map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 lg:p-5 shadow-xl`}>
                <div className="text-xl lg:text-2xl mb-1 lg:mb-2">{s.icon}</div>
                <p className="text-xl lg:text-3xl font-black text-white">{s.value}</p>
                <p className="text-white/70 text-xs lg:text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

            {/* Purchases Table */}
            <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-bold text-white">Purchase History</h2>
                <Link href="/marketplace" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  + Buy more →
                </Link>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4" />
                  Loading your purchases…
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <div className="text-5xl mb-4">🛒</div>
                  <p className="text-lg font-semibold text-slate-400">No purchases yet</p>
                  <p className="text-sm mt-1 mb-6">Browse the marketplace to find great deals</p>
                  <Link href="/marketplace">
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all">
                      Browse Marketplace
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
                          {['Card', 'Amount (ETH)', 'Status', 'Card Status', 'Date', 'Actions'].map(h => (
                            <th key={h} className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-4 lg:px-6 py-4">
                              <div>
                                <p className="font-semibold text-white text-sm">{p.card?.name || `Card #${p.card_id}`}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{p.card?.retailer}</p>
                                {canViewDetails(p) && (
                                  <div className="mt-2">
                                    <button
                                      onClick={() => toggleReveal(p.id)}
                                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      {revealed[p.id] ? 'Hide card details' : 'View card details'}
                                    </button>
                                    {revealed[p.id] && (
                                      <div className="mt-2 grid gap-2 text-xs">
                                        {p.card?.card_code && (
                                          <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                            <div className="min-w-0">
                                              <p className="text-slate-500">Code</p>
                                              <p className="text-slate-200 font-mono truncate">{p.card.card_code}</p>
                                            </div>
                                            <button
                                              onClick={() => copy(p.card?.card_code)}
                                              className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20"
                                            >
                                              Copy
                                            </button>
                                          </div>
                                        )}
                                        {p.card?.card_pin && (
                                          <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                            <div className="min-w-0">
                                              <p className="text-slate-500">PIN</p>
                                              <p className="text-slate-200 font-mono truncate">{p.card.card_pin}</p>
                                            </div>
                                            <button
                                              onClick={() => copy(p.card?.card_pin)}
                                              className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20"
                                            >
                                              Copy
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-sm font-mono text-slate-300 whitespace-nowrap">{p.amount.toFixed(6)}</td>
                            <td className="px-4 lg:px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${statusColors[p.status] || statusColors.pending}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${complaintColors[p.complaint_status] || complaintColors.none}`}>
                                {p.complaint_status === 'none' ? 'Pending review' : p.complaint_status}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}
                            </td>
                            <td className="px-4 lg:px-6 py-4">
                              {['holding', 'completed'].includes(p.status) && p.complaint_status !== 'valid' && (
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    id={`confirm-${p.id}`}
                                    disabled={actionLoading === p.id}
                                    onClick={() => handleConfirm(p.id)}
                                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {actionLoading === p.id ? '…' : '✓ Confirm'}
                                  </button>
                                  {p.complaint_status === 'none' && (
                                    <button
                                      id={`complain-${p.id}`}
                                      disabled={actionLoading === p.id}
                                      onClick={() => handleComplain(p.id)}
                                      className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-xs font-semibold border border-orange-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
                                    >
                                      {actionLoading === p.id ? '…' : '⚠ Complain'}
                                    </button>
                                  )}
                                </div>
                              )}
                              {p.complaint_status !== 'none' && (
                                <span className="text-xs text-slate-500 italic">Action taken</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block sm:hidden divide-y divide-white/5">
                    {payments.map((p) => (
                      <div key={p.id} className="px-4 py-4 hover:bg-white/2 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">{p.card?.name || `Card #${p.card_id}`}</p>
                            <p className="text-xs text-slate-500 mt-1">{p.card?.retailer}</p>
                            {canViewDetails(p) && (
                              <div className="mt-2">
                                <button
                                  onClick={() => toggleReveal(p.id)}
                                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  {revealed[p.id] ? 'Hide card details' : 'View card details'}
                                </button>
                                {revealed[p.id] && (
                                  <div className="mt-2 grid gap-2 text-xs">
                                    {p.card?.card_code && (
                                      <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                        <div className="min-w-0">
                                          <p className="text-slate-500">Code</p>
                                          <p className="text-slate-200 font-mono truncate">{p.card.card_code}</p>
                                        </div>
                                        <button
                                          onClick={() => copy(p.card?.card_code)}
                                          className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20"
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    )}
                                    {p.card?.card_pin && (
                                      <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                        <div className="min-w-0">
                                          <p className="text-slate-500">PIN</p>
                                          <p className="text-slate-200 font-mono truncate">{p.card.card_pin}</p>
                                        </div>
                                        <button
                                          onClick={() => copy(p.card?.card_pin)}
                                          className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20"
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ml-2 flex-shrink-0 ${statusColors[p.status] || statusColors.pending}`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                          <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-slate-500">Amount</p>
                            <p className="text-white font-semibold mt-1">{p.amount.toFixed(4)} ETH</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-slate-500">Card Status</p>
                            <p className={`font-semibold mt-1 ${complaintColors[p.complaint_status] ? 'text-slate-300' : 'text-slate-400'}`}>
                              {p.complaint_status === 'none' ? 'Pending' : p.complaint_status}
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2">
                            <p className="text-slate-500">Date</p>
                            <p className="text-white font-semibold mt-1">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : '—'}
                            </p>
                          </div>
                        </div>
                        {['holding', 'completed'].includes(p.status) && p.complaint_status !== 'valid' && (
                          <div className="flex gap-2 flex-col">
                            <button
                              id={`confirm-${p.id}`}
                              disabled={actionLoading === p.id}
                              onClick={() => handleConfirm(p.id)}
                              className="w-full px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20 transition-all disabled:opacity-50"
                            >
                              {actionLoading === p.id ? 'Confirming…' : '✓ Confirm'}
                            </button>
                            {p.complaint_status === 'none' && (
                              <button
                                id={`complain-${p.id}`}
                                disabled={actionLoading === p.id}
                                onClick={() => handleComplain(p.id)}
                                className="w-full px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-xs font-semibold border border-orange-500/20 transition-all disabled:opacity-50"
                              >
                                {actionLoading === p.id ? 'Filing…' : '⚠ File Complaint'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
        </main>
      </div>
    </div>
  );
}
