'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useResetPassword } from '@/features/auth/hooks/useAuth';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  
  const { mutate: resetPassword, isPending } = useResetPassword();
  
  const [form, setForm] = useState({ code: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.code.length !== 4) {
      setError('Please enter the 4-digit reset code');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (email) {
      resetPassword({ email, code: form.code, newPassword: form.newPassword }, {
        onError: (err: any) => setError(err.message || 'Reset failed'),
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h1>
          <p className="text-slate-400 text-sm mb-7 text-center">
            Enter the code sent to <span className="text-blue-400 font-medium">{email}</span> and your new password
          </p>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">4-Digit Reset Code</label>
              <input
                id="reset-code"
                type="text"
                required
                maxLength={4}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '') })}
                placeholder="1234"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-xl font-bold text-center tracking-widest outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <input
                id="reset-password"
                type="password"
                required
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
              <input
                id="reset-confirm-password"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              id="reset-submit"
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Cancel and Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <ResetPasswordInner />
      </Suspense>
    );
}
