'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVerifyEmail, useResendVerification } from '@/features/auth/hooks/useAuth';
import Swal from 'sweetalert2';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  
  const { mutate: verify, isPending } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendVerification();
  
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const verificationCode = code.join('');
    if (verificationCode.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    if (email) {
      verify({ email, code: verificationCode }, {
        onError: (err: any) => {
          if (err.message === 'User already verified' || err.message?.includes('already verified')) {
            Swal.fire({
              title: 'Already Verified!',
              text: 'Your email is already verified. Redirecting to login...',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              background: '#0f172a',
              color: '#fff',
            }).then(() => {
              router.push('/login');
            });
          } else {
            setError(err.message || 'Verification failed');
          }
        },
      });
    }
  };

  const handleResend = () => {
    setError(null);
    setSuccess(null);
    if (email) {
      resend(email, {
        onSuccess: (data) => setSuccess(data.message),
        onError: (err: any) => {
          if (err.message === 'User already verified' || err.message?.includes('already verified')) {
            Swal.fire({
              title: 'Already Verified!',
              text: 'Your email is already verified. Redirecting to login...',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              background: '#0f172a',
              color: '#fff',
            }).then(() => {
              router.push('/login');
            });
          } else {
            setError(err.message || 'Failed to resend code');
          }
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Verify your email</h1>
          <p className="text-slate-400 text-sm mb-8 text-center">
            We've sent a 4-digit code to <span className="text-blue-400 font-medium">{email}</span>
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm font-medium text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-4">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-14 h-16 bg-white/5 border border-white/10 text-white text-3xl font-bold text-center rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              ))}
            </div>

            <button
              id="verify-submit"
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            <Link href="/signup" className="hover:text-slate-300 transition-colors">
              Back to Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <VerifyEmailInner />
      </Suspense>
    );
}
