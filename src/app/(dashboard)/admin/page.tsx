'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useLogout } from '@/features/auth/hooks/useAuth';

interface Card {
  id: number;
  name: string;
  description: string;
  price: number;
  status: string;
  retailer: string;
  seller_id: number;
  card_code?: string;
  created_at?: string;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const logout = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Fetch pending cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch cards');
        const data = await res.json();
        setCards(data.filter((c: Card) => c.status === 'pending_approval'));
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleAction = async (cardId: number, action: 'approve' | 'reject') => {
    setActionLoading(cardId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/cards/${cardId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${action} card`);
      }
      setCards(cards.filter((c) => c.id !== cardId));
      alert(`Card ${action}d successfully!`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Mock data for demonstration
  const stats = {
    totalUsers: 1250,
    totalTransactions: 5643,
    totalVolume: 285750,
    pendingVerifications: cards.length,
    fraudReports: 3,
  };

  if (authLoading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  // Prevent rendering if not authenticated or not admin (middleware will redirect)
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-white">GitCard Crypto</p>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <div className="bg-purple-600/20 text-purple-400 rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify Cards
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 5v1m6.364-1.636l-1.414-1.414m2.828 1.414l1.414-1.414m-2.828-2.828l-1.414 1.414m2.828-1.414l1.414 1.414M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              Report Issues
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM4 20h16c1.1 0 2-.9 2-2v-2a6 6 0 00-12 0v2c0 1.1.9 2 2 2z" />
              </svg>
              Users
            </button>
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="mb-3 px-3 py-2 bg-white/5 rounded-xl">
              <p className="text-xs text-slate-500">Logged in as</p>
              <p className="text-sm font-medium text-slate-300 truncate">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">Admin</span>
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
            <span className="font-bold text-white text-sm">Admin Dashboard</span>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 mt-1 text-sm">Platform Management & Monitoring</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-700 to-blue-900' },
                { label: 'Transactions', value: stats.totalTransactions, icon: '💱', color: 'from-emerald-700 to-emerald-900' },
                { label: 'Total Volume', value: `$${(stats.totalVolume / 1000).toFixed(0)}k`, icon: '💰', color: 'from-purple-700 to-purple-900' },
                { label: 'Pending', value: stats.pendingVerifications, icon: '⏳', color: 'from-yellow-700 to-yellow-900' },
                { label: 'Fraud Reports', value: stats.fraudReports, icon: '🚨', color: 'from-red-700 to-red-900' },
              ].map((s) => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 lg:p-5 shadow-xl`}>
                  <div className="text-xl lg:text-2xl mb-1 lg:mb-2">{s.icon}</div>
                  <p className="text-lg lg:text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-white/70 text-xs lg:text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 lg:mb-8">
              <button className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Review Pending Verifications
              </button>
              <button className="px-6 py-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 5v1m6.364-1.636l-1.414-1.414" />
                </svg>
                View Fraud Reports ({stats.fraudReports})
              </button>
            </div>

            {/* Verification Queue */}
            <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-white/5">
                <h2 className="text-base lg:text-lg font-bold text-white">Pending Card Verifications</h2>
              </div>
              {loading ? (
                <div className="px-4 lg:px-6 py-8 lg:py-12 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="px-4 lg:px-6 py-8 lg:py-12 text-center text-red-400">
                  {error}
                </div>
              ) : cards.length === 0 ? (
                <div className="px-4 lg:px-6 py-8 lg:py-12 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl lg:text-5xl mb-4">✅</div>
                  <p className="text-lg lg:text-xl font-semibold text-slate-300">No pending cards</p>
                  <p className="text-sm text-slate-500 mt-2">All cards have been reviewed</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 text-left text-xs text-slate-500">
                        <th className="px-4 lg:px-6 py-3">ID</th>
                        <th className="px-4 lg:px-6 py-3">Name</th>
                        <th className="px-4 lg:px-6 py-3">Retailer</th>
                        <th className="px-4 lg:px-6 py-3">Price</th>
                        <th className="px-4 lg:px-6 py-3">Seller ID</th>
                        <th className="px-4 lg:px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((card) => (
                        <tr key={card.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-4 lg:px-6 py-3 text-sm text-slate-300">{card.id}</td>
                          <td className="px-4 lg:px-6 py-3 text-sm text-white font-medium">{card.name}</td>
                          <td className="px-4 lg:px-6 py-3 text-sm text-slate-300">{card.retailer}</td>
                          <td className="px-4 lg:px-6 py-3 text-sm text-slate-300">${card.price}</td>
                          <td className="px-4 lg:px-6 py-3 text-sm text-slate-300">{card.seller_id}</td>
                          <td className="px-4 lg:px-6 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction(card.id, 'approve')}
                                disabled={actionLoading === card.id}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all"
                              >
                                {actionLoading === card.id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleAction(card.id, 'reject')}
                                disabled={actionLoading === card.id}
                                className="px-3 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all"
                              >
                                {actionLoading === card.id ? '...' : 'Reject'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
