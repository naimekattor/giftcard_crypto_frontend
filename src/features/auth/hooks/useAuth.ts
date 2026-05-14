'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/contexts/AuthContext';
export { useAuth };
import { authService } from '@/features/auth/services/authService';
import type { LoginPayload, RegisterPayload } from '@/features/auth/services/authService';

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const result = await authService.login(payload);
      login({ email: result.email, role: result.role as 'buyer' | 'seller', token: result.token });
      return result;
    },
    onSuccess: (result) => {
      router.push(result.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer');
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await authService.register(payload);
      return payload.email;
    },
    onSuccess: (email) => {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      return authService.verifyEmail(email, code);
    },
    onSuccess: () => {
      router.push('/login?registered=true');
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      return authService.resendVerification(email);
    },
  });
}

export function useForgotPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (email: string) => {
      return authService.forgotPassword(email);
    },
    onSuccess: (_, email) => {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: { email: string; code: string; newPassword: string }) => {
      return authService.resetPassword(payload);
    },
    onSuccess: () => {
      router.push('/login?reset=true');
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();

  return () => {
    logout();
    router.push('/login');
  };
}
