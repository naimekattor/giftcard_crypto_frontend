'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { buyerApi, type PaymentRecord } from '@/services/dashboardApi';
import Swal from 'sweetalert2';

const RevealCountdown = ({ purchasedAt, createdAt }: { purchasedAt?: string; createdAt?: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>('24:00:00');

  useEffect(() => {
    const target = new Date(purchasedAt || createdAt || Date.now()).getTime() + 24 * 60 * 60 * 1000;
    
    const update = () => {
      const remaining = target - Date.now();
      if (remaining <= 0) {
        setTimeLeft('Auto-Revealed');
        return;
      }
      const hrs = Math.floor(remaining / (3600 * 1000));
      const mins = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
      const secs = Math.floor((remaining % (60 * 1000)) / 1000);
      setTimeLeft(
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [purchasedAt, createdAt]);

  return <span className="font-mono font-bold text-yellow-500">{timeLeft}</span>;
};

const RevealedTimeAgo = ({ revealedAt }: { revealedAt: string }) => {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const diffMs = Date.now() - new Date(revealedAt).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) {
        setText('just now');
      } else if (diffMins < 60) {
        setText(`${diffMins} minute${diffMins > 1 ? 's' : ''} ago`);
      } else {
        const diffHrs = Math.floor(diffMins / 60);
        setText(`${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [revealedAt]);

  return <span className="text-emerald-400 font-medium">{text}</span>;
};

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
  const router = useRouter();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
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
    
    const { value: reason } = await Swal.fire({
      title: 'File a complaint?',
      text: 'Please select a reason for your dispute. This will hold the seller payout for admin review.',
      icon: 'warning',
      input: 'select',
      inputOptions: {
        'Invalid gift card': 'Invalid gift card',
        'Already redeemed': 'Already redeemed',
        'Wrong balance': 'Wrong balance',
        'Used card': 'Used card',
        'Seller fraud': 'Seller fraud',
        'Other issue': 'Other issue'
      },
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Submit Dispute',
      background: '#0f172a',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
      },
      inputValidator: (value) => {
        if (!value) {
          return 'You need to select a reason!';
        }
      }
    });

    if (!reason) return;

    setActionLoading(id);
    try {
      await buyerApi.complain(user.token, id, reason);
      
      Swal.fire({
        title: 'Dispute Filed!',
        text: 'Seller payout is held for admin review.',
        icon: 'success',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
      });
      load();
    } catch (e: any) {
      Swal.fire({
        title: 'Error',
        text: e.message,
        icon: 'error',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = async (id: number) => {
    if (!user) return;

    const result = await Swal.fire({
      title: 'Confirm Card Validity?',
      text: 'Once confirmed, funds will be released to the seller.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981', // emerald-500
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, it works!',
      background: '#0f172a',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
      }
    });

    if (!result.isConfirmed) return;

    setActionLoading(id);
    try {
      await buyerApi.confirm(user.token, id);
      Swal.fire({
        title: 'Success!',
        text: 'Gift card confirmed as valid!',
        icon: 'success',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
      });
      load();
    } catch (e: any) {
      Swal.fire({
        title: 'Error',
        text: e.message,
        icon: 'error',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const canViewDetails = (p: PaymentRecord) =>
    ['holding', 'completed', 'disputed'].includes(p.status);

  const handleRevealCode = async (id: number) => {
    if (!user) return;

    const result = await Swal.fire({
      title: 'Reveal Gift Card Code?',
      html: `
        <div class="text-left space-y-3">
          <p class="font-bold text-yellow-400">Are you sure you'd like to reveal the gift card?</p>
          <p class="text-sm text-slate-300">We recommend using your gift card within 2 hours to prevent any gift card issues.</p>
          <p class="text-xs text-slate-400">You still have 24 hours for any complaints.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Reveal Code',
      background: '#0f172a',
      color: '#fff',
      customClass: {
        popup: 'rounded-2xl border border-white/10',
      }
    });

    if (!result.isConfirmed) return;

    setActionLoading(id);
    try {
      const updated = await buyerApi.reveal(user.token, id);
      setPayments(prev => prev.map(p => p.id === id ? updated : p));
      setRevealed(prev => ({ ...prev, [id]: true }));
      Swal.fire({
        title: 'Revealed!',
        text: 'The gift card details are now visible.',
        icon: 'success',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
      });
    } catch (e: any) {
      Swal.fire({
        title: 'Error',
        text: e.message,
        icon: 'error',
        background: '#0f172a',
        color: '#fff',
      });
    } finally {
      setActionLoading(null);
    }
  };

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

  // Prevent rendering dashboard if not authenticated (middleware will redirect)
  if (!user) return null;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl font-medium text-sm transition-all ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Buyer Dashboard</h1>
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
                <p className="text-xl lg:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-white/70 text-xs lg:text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

            {/* Purchases Table */}
            <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-base lg:text-lg font-bold text-white">Purchase History</h2>
                <Link href="/buy-gift-cards" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
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
                  <Link href="/buy-gift-cards">
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
                                    {p.isRevealed || p.autoRevealed ? (
                                      <>
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
                                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                              <span>Status:</span>
                                              <RevealedTimeAgo revealedAt={p.revealedAt || p.autoRevealedAt || p.created_at || ''} />
                                              {p.autoRevealed && <span className="text-yellow-500/70">(Auto-revealed)</span>}
                                            </div>

                                            {p.status === 'holding' && p.complaint_status === 'none' && (
                                              <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-[11px] space-y-1">
                                                <p className="font-semibold text-blue-300">Have you redeemed your gift card yet?</p>
                                                <p className="text-slate-400">Please confirm if it works to release funds to the seller. You still have the 24h safety escrow window.</p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="mt-2 flex flex-col gap-2 max-w-[200px] bg-white/5 border border-white/5 p-3 rounded-xl">
                                        <div className="grid gap-1 text-[11px] text-slate-400 mb-1">
                                          <div className="flex justify-between">
                                            <span>Code:</span>
                                            <span className="font-mono">•••• ••••</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>PIN:</span>
                                            <span className="font-mono">••••</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
                                          <span>Auto-reveal in:</span>
                                          <RevealCountdown purchasedAt={p.purchasedAt} createdAt={p.created_at} />
                                        </div>
                                        <button
                                          onClick={() => handleRevealCode(p.id)}
                                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                                        >
                                          REVEAL CODE
                                        </button>
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
                                {p.isRevealed || p.autoRevealed ? (
                                  <>
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
                                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                          <span>Status:</span>
                                          <RevealedTimeAgo revealedAt={p.revealedAt || p.autoRevealedAt || p.created_at || ''} />
                                          {p.autoRevealed && <span className="text-yellow-500/70">(Auto-revealed)</span>}
                                        </div>

                                        {p.status === 'holding' && p.complaint_status === 'none' && (
                                          <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-[11px] space-y-1">
                                            <p className="font-semibold text-blue-300">Have you redeemed your gift card yet?</p>
                                            <p className="text-slate-400">Please confirm if it works to release funds to the seller. You still have the 24h safety escrow window.</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="mt-2 flex flex-col gap-2 max-w-[200px] bg-white/5 border border-white/5 p-3 rounded-xl">
                                    <div className="grid gap-1 text-[11px] text-slate-400 mb-1">
                                      <div className="flex justify-between">
                                        <span>Code:</span>
                                        <span className="font-mono">•••• ••••</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>PIN:</span>
                                        <span className="font-mono">••••</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
                                      <span>Auto-reveal in:</span>
                                      <RevealCountdown purchasedAt={p.purchasedAt} createdAt={p.created_at} />
                                    </div>
                                    <button
                                      onClick={() => handleRevealCode(p.id)}
                                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                                    >
                                      REVEAL CODE
                                    </button>
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
    </>
  );
}
