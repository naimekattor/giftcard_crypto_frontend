'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '@/features/auth/hooks/useAuth';
import Image from 'next/image';

type Role = 'buyer' | 'seller';

export default function SignupPage() {
  const { mutate: register, isPending } = useRegister();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', role: 'buyer' as Role });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    register({ email: form.email, password: form.password, role: form.role }, {
      onError: (err: any) => setError(err.message || 'Registration failed'),
    });
  };

  const roles: { value: Role; label: string; icon: string; desc: string }[] = [
    { value: 'buyer', label: 'Buyer', icon: '🛒', desc: 'Browse & purchase gift cards' },
    { value: 'seller', label: 'Seller', icon: '💳', desc: 'List & sell your gift cards' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      {/* Glow orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 py-4 px-8 bg-transparent border border-white/10 rounded-2xl">
                        <Image src="/logo.png" alt="GiftCard Market" width={150} height={40} style={{ mixBlendMode: 'lighten' }}/>
                      </Link>
          <p className="text-slate-400 text-sm">Join the crypto gift card marketplace</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-slate-400 text-sm mb-7">Choose your role and get started</p>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                id={`role-${r.value}`}
                onClick={() => setForm({ ...form, role: r.value })}
                className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                  form.role === r.value
                    ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/20'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="font-bold text-sm">{r.label}</span>
                <span className="text-xs opacity-70 leading-tight">{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <input
                id="signup-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                id="signup-password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm password</label>
              <input
                id="signup-confirm-password"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : `Create ${form.role === 'seller' ? 'Seller' : 'Buyer'} Account`}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          🔐 Your data is secure and private
        </p>
      </div>
    </div>
  );
}
