'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForgotPassword } from '@/features/auth/hooks/useAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    forgotPassword(email, {
      onError: (err: any) => setError(err.message || 'Request failed'),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
          <p className="text-slate-400 text-sm mb-7">Enter your email to receive a 4-digit reset code</p>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              id="forgot-submit"
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Remembered your password?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
